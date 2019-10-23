/* external modules */
var qs = require('query-string');
var mongodb = require('mongodb');

/* own modules */
var lib = require('./lib');
var common = require('./common');

module.exports = function(url, req, rep, query, payload) {

    switch(url) {

        case '/konto':
            switch(req.method) {
                case 'GET':
                    lib.sendJSON(rep, common.konto);
                    break;
                case 'POST':
                    var mnoznik = 0;
                    switch(payload.operacja) {
                        case 'wy': mnoznik = -1; break;
                        case 'wp': mnoznik = +1; break;
                    }
                    if(mnoznik == 0 || payload.kwota <= 0) {
                        lib.sendJSONWithError(rep, 400, 'Invalid operation data');
                    } else if(common.konto.saldo + mnoznik * payload.kwota < common.konto.limit) {
                        lib.sendJSONWithError(rep, 400, 'Limit exceeded');
                    } else {
                        common.konto.saldo += mnoznik * payload.kwota;
                        lib.sendJSON(rep, common.konto);
                    }
                    break;
                default:
                    lib.sendJSONWithError(rep, 400, 'Invalid method ' + req.method + ' for ' + url);
            }
            break;

        case '/persons':
            if(!query || !query.id) {
                common.persons.find().toArray(function(err, docs) {
                    if(err) {
                        lib.sendJSONWithError(rep, 400, 'Database error');
                    } else {
                        lib.sendJSON(rep, docs);
                    }
                });
            } else {
                try {
                    common.persons.findOne({_id: mongodb.ObjectId(query.id)}, {}, function(err, doc) {
                        if(err) {
                            lib.sendJSONWithError(rep, 400, 'Database error');
                        } else {
                            lib.sendJSON(rep, doc);
                        }
                    });
                } catch(ex) {
                    lib.sendJSONWithError(rep, 400, 'Invalid id');
                }
            }
            break;

        default:
            lib.sendJSONWithError(rep, 400, 'Invalid rest endpoint ' + url);
    }
};