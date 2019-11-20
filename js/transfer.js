app.controller("Transfer", [ '$http', function($http) {
    var ctrl = this;
    
    var initVars = function() {
        ctrl.account = {};
        ctrl.transaction = { operation: "wi", amount: 0, description: "" };
    };

    initVars();

    var refreshAccount = function() {
        $http.get('/account').then(
            function (rep) { ctrl.account = rep.data; },
            function (err) {}
        );
    };

    ctrl.doTransfer = function() {
        $http.post('/account', ctrl.transaction).then(
            function (rep) {
                ctrl.account = rep.data;
            },
            function (err) {}
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

    refreshAccount();
}]);