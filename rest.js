/* external modules */
var qs = require('query-string');
var mongodb = require('mongodb');

/* own modules */
var lib = require('./lib');
var common = require('./common');

module.exports = function(url, req, rep, query, payload) {

    console.log('REST handling ' + req.method + ' ' + url + ' query ' + JSON.stringify(query) + ' payload ' + JSON.stringify(payload));
    switch(url) {

        case '/account':
            switch(req.method) {
                case 'GET':
                    common.accounts.findOne({_id: mongodb.ObjectId(common.accountNo)}, {}, function(err, account) {
                        if(err) {
                            lib.sendJSONWithError(rep, 400, 'No such object'); return;
                        }
                        delete account.password;                
                        lib.sendJSON(rep, account);
                    });
                    break;
                case 'POST':
                    common.accounts.findOne({_id: mongodb.ObjectId(common.accountNo)}, {}, function(err, account) {
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
                            common.accounts.findOneAndUpdate({_id: mongodb.ObjectId(common.accountNo)},
                                {$set: {balance: account.balance + multiplier * payload.amount, lastOperation: new Date().getTime()}},
                                {returnOriginal: false}, function(err, updateData) {
                                if(err) {
                                    lib.sendJSONWithError(rep, 400, 'Update failed'); return;
                                }
                                common.history.insertOne({
                                    date: updateData.value.lastOperation,
                                    account: common.accountNo,
                                    operation: payload.operation,
                                    amount: payload.amount,
                                    balance: updateData.value.balance
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
            common.history.find().sort({date:1}).toArray(function(err, entries) {
                if(err) {
                    lib.sendJSONWithError(rep, 400, 'History disabled'); return;    
                }
                lib.sendJSON(rep, entries);
            });
            break;
        default:
            lib.sendJSONWithError(rep, 400, 'Invalid rest endpoint ' + url);
    }
};