/* internal modules */
var http = require('http');
var fs = require('fs');
var qs = require('query-string');

/* external modules */
var mongodb = require('mongodb');

/* own modules */
var lib = require('./lib');

/* configuration */
var config = {};
try {
    var content = fs.readFileSync('config.json');
    config = JSON.parse(content);
} catch(ex) {
    console.error(ex.message);
    process.exit(1);
}

/* collections */
var persons = null;

/* data */
var konto = {
    saldo: 100,
    limit: -1000
};

/* HTTP server */
var httpServer = http.createServer();

httpServer.on('request', function (req, rep) {
    console.log('<<< ' + req.method + ' ' + req.url);

	if(req.url == '/') {
		lib.serveStaticContent(rep, 'html/index.html');
	} else if(req.url == '/favicon.ico') {
		lib.serveStaticContent(rep, 'img/favicon.ico');
    } else if(/^\/(html|css|js|fonts|img)\//.test(req.url)) {
        lib.serveStaticContent(rep, '.' + req.url);
    } else if(req.url == '/konto') {
        switch(req.method) {
            case 'GET':
                lib.sendJSON(rep, konto);
                break;
            case 'POST':
                lib.payload2JSON(req, rep, function(req, rep, op, err) {
                    if(err) {
                        lib.sendJSONWithError(rep, 400, err.text);
                    } else {
                        var mnoznik = 0;
                        switch(op.operacja) {
                            case 'wy': mnoznik = -1; break;
                            case 'wp': mnoznik = +1; break;
                        }
                        if(mnoznik == 0 || op.kwota <= 0) {
                            lib.sendJSONWithError(rep, 400, 'Invalid operation data');
                        } else if(konto.saldo + mnoznik * op.kwota < konto.limit) {
                            lib.sendJSONWithError(rep, 400, 'Limit exceeded');
                        } else {
                            konto.saldo += mnoznik * op.kwota;
                            lib.sendJSON(rep, konto);
                        }
                    }
                });
                break;
            default:
                lib.sendJSONWithError(rep, 400, 'Invalid method ' + req.method + ' for ' + req.url);
        }
    } else if(req.url == '/persons') {
        persons.find().toArray(function(err, docs) {
            if(err) {
                lib.sendJSONWithError(rep, 400, 'DBERROR');
            } else {
                lib.sendJSON(rep, docs);
            }
        });
    } else if(/^\/persons?/.test(req.url)) {
        var pars = qs.parseUrl(req.url);
        var id = pars.query.id;
        persons.findOne({_id: mongodb.ObjectId(id)}, {}, function(err, doc) {
            if(err) {
                lib.sendJSONWithError(rep, 400, 'DBERROR');
            } else {
                lib.sendJSON(rep, doc);
            }
        });
    } else {
	    lib.sendErrorOnStaticContent(rep, 403);
    }
});

/* main */

process.on('uncaughtException', function(err) {
    console.error('Runtime error ' + err.code + ' in the function \'' + err.syscall + '\'');
    process.exit(1);
});

mongodb.MongoClient.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, conn) {
    if(err) {
        console.error('Connection to ' + config.db + ' failed: ' + err.name);
        process.exit(2);
    }
    var db = conn.db(config.dbName);
    persons = db.collection('persons');
    console.log('Connection with ' + config.db + ' established');
    httpServer.listen(config.port);
    console.log("HTTP server is listening on the port " + config.port);
});
