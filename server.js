/* internal modules */
var http = require('http');

/* own modules */
var lib = require('./lib');

/* configuration */
var config = {
    port: 8888
};

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
                        if(konto.saldo + mnoznik * op.kwota < konto.limit) {
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
    } else {
	    lib.sendErrorOnStaticContent(rep, 403);
    }
});

/* main */

process.on('uncaughtException', function(err) {
    console.error('Runtime error ' + err.code + ' in the function \'' + err.syscall + '\'');
    process.exit(1);
});

httpServer.listen(config.port);
console.log("HTTP server is listening on the port " + config.port);