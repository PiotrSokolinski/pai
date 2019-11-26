app.controller("Transfer", [ '$http', 'common', function($http, common) {
    var ctrl = this;
    
    var initVars = function() {
        ctrl.account = {};
        ctrl.emails = [];
        ctrl.transaction = { recipient: "", amount: 0, description: "" };
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
                common.showMessage('Przelew udany');
            },
            function (err) {
                common.showError('Przelew nieudany');
            }
        );
    };

    ctrl.formInvalid = function() {
        return ctrl.transaction.amount <= 0 || ctrl.account.balance - ctrl.transaction.amount < ctrl.account.limit;
    };

    refreshAccount();

    $http.get('/emails').then(function(rep) {
        ctrl.emails = rep.data;
    }, function(err) {});
}]);