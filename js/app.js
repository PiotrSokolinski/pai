var app1 = angular.module("app1", []);

app1.controller("Ctrl1", [ "$http", function($http) {
    var ctrl = this;
    
    const defCreds = { email: 'jim@beam.com', password: 'admin1' };

    ctrl.login = null;
    ctrl.creds = defCreds;
    ctrl.account = {};
    ctrl.historyCount = 0;
    ctrl.limit = 5;
    ctrl.filter = '';

    $http.get('/login').then(
        function(rep) { ctrl.login = rep.data.email; },
        function(err) {}
    );

    ctrl.doLogin = function() {
        $http.post('/login', ctrl.creds).then(
            function(rep) { 
                ctrl.transaction = { operation: "wi", amount: 0, description: '' },
                ctrl.login = rep.data.email;
                ctrl.message = 'Login ok';
                refreshAll();
            },
            function(err) { ctrl.message = err.data.error; }
        );
    };

    ctrl.doLogout = function() {
        $http.delete('/login').then(
            function(rep) {
                ctrl.login = null;
                ctrl.transaction = { operation: "wi", amount: 0, description: '' },
                ctrl.creds = defCreds;
                ctrl.message = 'Logout ok';
                refreshAll();
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

    ctrl.transaction = { operation: "wi", amount: 0, description: "" };
    ctrl.message = '';
    
    ctrl.doTransfer = function() {
        $http.post('/account', ctrl.transaction).then(
            function (rep) {
                ctrl.account = rep.data;
                ctrl.message = 'ok';
                if(ctrl.history.length >= ctrl.limit) {
                    ctrl.history.pop();
                }
                ctrl.history.unshift({ date: ctrl.account.lastOperation, operation: ctrl.transaction.operation, amount: ctrl.transaction.amount, description: ctrl.transaction.description, balance: ctrl.account.balance});
                refreshHistoryCount();
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
    var refreshHistoryCount = function() {
        $http.delete('/history').then(
            function(rep) { ctrl.historyCount = rep.data.count; },
            function(err) {}
        );
    };
    var refreshAll = function() {
        refreshAccount();
        refreshHistoryCount();
        ctrl.refreshHistory();
    };
    ctrl.refreshHistory = function() {
        refreshHistoryCount();
        $http.get('/history?skip=0&limit=' + ctrl.limit + '&filter=' + ctrl.filter).then(
            function(rep) { ctrl.history = rep.data; },
            function(err) {}
        );
    }
    ctrl.stamp2date = function(stamp) {
        return new Date(stamp).toLocaleString();
    };
    ctrl.loadMore = function() {
        ctrl.limit += 5;
        if(ctrl.limit > ctrl.historyCount) ctrl.limit = ctrl.historyCount;
        ctrl.refreshHistory();
    };

    refreshAll();

}]);