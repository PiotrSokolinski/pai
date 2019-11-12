/* external modules */
var mongodb = require('mongodb');

/* own modules */
var lib = require('./lib');
var common = require('./common');

module.exports = function(url, req, rep, query, payload, session) {

    console.log('REST handling ' + req.method + ' ' + url + ' query ' + JSON.stringify(query) + ' payload ' + JSON.stringify(payload) + ' session ' + session);
    switch(url) {
        case '/account':
            if(!common.sessions[session].accountNo) {
                lib.sendJSONWithError(rep, 401, 'You are not logged in'); return;
            }
            switch(req.method) {
                case 'GET':
                    common.accounts.findOne({_id: common.sessions[session].accountNo}, {}, function(err, account) {
                        if(err) {
                            lib.sendJSONWithError(rep, 400, 'No such object'); return;
                        }
                        delete account.password;                
                        lib.sendJSON(rep, account);
                    });
                    break;
                case 'POST':
                    common.accounts.findOne({_id: common.sessions[session].accountNo}, {}, function(err, account) {
                        if(err) {
                            lib.sendJSONWithError(rep, 400, 'No such object'); return;
                        }                
                        var multiplier = 0;
                        switch(payload.operation) {
                            case 'wi': multiplier = -1; break;
                            case 'de': multiplier = +1; break;
                        }
                        if(multiplier == 0 || isNaN(payload.amount) || payload.amount <= 0) {
                            lib.sendJSONWithError(rep, 400, 'Invalid operation data');
                        } else if(account.balance + multiplier * payload.amount < account.limit) {
                            lib.sendJSONWithError(rep, 400, 'Limit exceeded');
                        } else {
                            common.accounts.findOneAndUpdate({_id: common.sessions[session].accountNo},
                                {$set: {balance: account.balance + multiplier * payload.amount, lastOperation: new Date().getTime()}},
                                {returnOriginal: false}, function(err, updateData) {
                                if(err) {
                                    lib.sendJSONWithError(rep, 400, 'Update failed'); return;
                                }
                                common.history.insertOne({
                                    date: updateData.value.lastOperation,
                                    account: common.sessions[session].accountNo,
                                    operation: payload.operation,
                                    amount: payload.amount,
                                    balance: updateData.value.balance,
                                    description: payload.description
                                });
                                delete updateData.value.password;
                                lib.sendJSON(rep, updateData.value);    
                            });
                        }
                    });
                    break;
                default:
                    lib.sendJSONWithError(rep, 400, 'Invalid method ' + req.method + ' for ' + url);
            }
            break;
        case '/history':
            switch(req.method) {
                case 'GET':
                    if(!common.sessions[session].accountNo) {
                        lib.sendJSONWithError(rep, 401, 'You are not logged in'); return;    
                    }
                    var skip = parseInt(query.skip);
                    var limit = parseInt(query.limit);
                    if(isNaN(skip) || isNaN(limit) || skip < 0 || limit <= 0) {
                        lib.sendJSONWithError(rep, 400, 'Skip/limit errornous'); return;    
                        return;
                    }
                    var q = {account: common.sessions[session].accountNo};
                    if(query.filter) {
                        q.description = {$regex: new RegExp(query.filter), $options: 'si'};
                    }
                    console.log('QUERY ' + JSON.stringify(q));
                    common.history.find(q).sort({date: -1}).skip(skip).limit(limit).toArray(function(err, entries) {
                        if(err) {
                            lib.sendJSONWithError(rep, 400, 'History disabled'); return;    
                        }
                        lib.sendJSON(rep, entries);
                    });
                    break;
                case 'DELETE':
                    if(!common.sessions[session].accountNo) {
                        lib.sendJSONWithError(rep, 401, 'You are not logged in'); return;    
                    }
                    common.history.count({account: common.sessions[session].accountNo}, {}, function(err, n) {
                        lib.sendJSON(rep, {count: n});
                    });
                    break;
            }
            break;
        case '/login':
            switch(req.method) {
                case 'GET':
                    lib.sendJSON(rep, common.sessions[session]);
                    break;
                case 'POST':
                    if(!payload || !payload.email || !payload.password) {
                        lib.sendJSONWithError(rep, 401, 'Invalid credentials');
                        return;
                    }
                    common.accounts.findOne(payload, {}, function(err, account) {
                        if(err || !account) {
                            lib.sendJSONWithError(rep, 401, 'Bad password');
                            return;
                        }
                        common.sessions[session].accountNo = mongodb.ObjectId(account._id);
                        common.sessions[session].email = account.email;
                        lib.sendJSON(rep, account);
                    });
                    break;
                case 'DELETE':
                    delete common.sessions[session].accountNo;
                    delete common.sessions[session].email;
                    lib.sendJSON(rep, common.sessions[session]);
                    break;
                default:
                    lib.sendJSONWithError(rep, 400, 'Invalid method ' + req.method + ' for ' + url);
            }
            break;
        default:
            lib.sendJSONWithError(rep, 400, 'Invalid rest endpoint ' + url);
    }
};