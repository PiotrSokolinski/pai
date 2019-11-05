var app1 = angular.module("app1", []);

app1.controller("Ctrl1", [ "$http", function($http) {
    var ctrl = this;

    ctrl.login = null;
    ctrl.creds = {};
    ctrl.account = {};

    $http.get('/login').then(
        function(rep) { ctrl.login = rep.data.email; },
        function(err) {}
    );

    ctrl.doLogin = function() {
        $http.post('/login', ctrl.creds).then(
            function(rep) { 
                ctrl.login = rep.data.email;
                refreshAccount();
                refreshHistory()
            },
            function(err) { ctrl.message = err.data.error; }
        );
    };

    ctrl.doLogout = function() {
        $http.delete('/login').then(
            function(rep) {
                ctrl.login = null;
                ctrl.account = {};
                ctrl.history = [];
                ctrl.transaction = { operation: "wi", amount: 0 },
                ctrl.creds = {}
            },
            function(err) { ctrl.message = err.data.error; }
        );
    };

    var refreshAccount = function() {
        $http.get('/account').then(
            function (rep) { ctrl.account = rep.data; },
            function (err) {}
        );
    };
    ctrl.transaction = { operation: "wi", amount: 0 };
    ctrl.message = '';
    ctrl.doTransfer = function() {
        $http.post('/account', ctrl.transaction).then(
            function (rep) {
                ctrl.account = rep.data;
                ctrl.message = 'ok';
                ctrl.history.push({ date: ctrl.account.lastOperation, operation: ctrl.transaction.operation, amount: ctrl.transaction.amount, balance: ctrl.account.balance});
            },
            function (err) { console.log(err); ctrl.message = err.data.error; }    
        );
    };
    ctrl.formInvalid = function() {
        var multiplier = 0;
        switch(ctrl.transaction.operation) {
            case 'wi': multiplier = -1; break;
            case 'de': multiplier = +1; break;
        }
        return ctrl.transaction.amount <= 0 || ctrl.account.balance + multiplier * ctrl.transaction.amount < ctrl.account.limit;
    };
    var refreshHistory = function() {
        $http.get('/history').then(
            function(rep) { ctrl.history = rep.data; },
            function(err) {}
        );
    }
    ctrl.stamp2date = function(stamp) {
        return new Date(stamp).toLocaleString();
    };
    refreshAccount();
    refreshHistory();
}]);