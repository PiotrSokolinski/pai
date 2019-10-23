/* internal modules */
var http = require('http');
var fs = require('fs');

/* external modules */
var qs = require('query-string');
var mongodb = require('mongodb');

/* own modules */
var lib = require('./lib');
var common = require('./common');
var rest = require('./rest');

/* configuration */
var config = {};
try {
    var content = fs.readFileSync('config.json');
    config = JSON.parse(content);
} catch(ex) {
    console.error(ex.message);
    process.exit(1);
}

/* HTTP server */
var httpServer = http.createServer();

httpServer.on('request', function (req, rep) {
    console.log('<<< ' + req.method + ' ' + req.url);
    var parsedUrl = qs.parseUrl(req.url);
    if(req.method == 'POST' || req.method == 'PUT') {
        /* requests with payload will be redirected to rest */
        lib.payload2JSON(req, rep, function(req, rep, payload, err) {
            if(err) {
                lib.sendJSONWithError(rep, 400, err.text);
            } else {
                rest(parsedUrl.url, req, rep, parsedUrl.query, payload);
            }
        });
        return;
    }

    switch(parsedUrl.url) {

        /* static content server */
        case '/':
            lib.serveStaticContent(rep, 'html/index.html'); break;
        case '/favicon.ico':
            lib.serveStaticContent(rep, 'img/favicon.ico'); break;
        default:
            /* file server */
            if(/^\/(html|css|js|fonts|img)\//.test(parsedUrl.url)) {
                lib.serveStaticContent(rep, '.' + parsedUrl.url);
            } else {
                /* not static content, try rest without payload */
                rest(parsedUrl.url, req, rep, parsedUrl.query, null);
            }
    }

});

/* main */

/* uncomment below to handling uncaught exceptions */
// process.on('uncaughtException', function(err) {
//     console.error('Runtime error ' + err.code + ' in the function \'' + err.syscall + '\'');
//     process.exit(1);
// });

mongodb.MongoClient.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, conn) {
    if(err) {
        console.error('Connection to ' + config.db + ' failed: ' + err.name);
        process.exit(2);
    }
    var db = conn.db(config.dbName);
    common.persons = db.collection('persons');
    console.log('Connection with ' + config.db + ' established');
    httpServer.listen(config.port);
    console.log("HTTP server is listening on the port " + config.port);
});
