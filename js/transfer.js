app.controller("Transfer", [ '$http', 'common', function($http, common) {
    var ctrl = this;
    
    ctrl.account = {};
    ctrl.emails = [];

    var initVars = function() {
        ctrl.transaction = { recipient: "", amount: "", description: "" };
    };

    initVars();

    $http.get('/account').then(function (rep) {
            ctrl.account = rep.data;
    });

    $http.get('/emails').then(function(rep) {
        ctrl.emails = rep.data;
    });

    ctrl.doTransfer = function() {
        $http.post('/account', ctrl.transaction).then(
            function (rep) {
                ctrl.account = rep.data;
                common.showMessage('Przelew udany');
                initVars();
            },
            function (err) {
                common.showError('Przelew nieudany, czy odbiorca jest poprawny?');
            }
        );
    };

    ctrl.formInvalid = function() {
        return ctrl.transaction.amount <= 0 || ctrl.account.balance - ctrl.transaction.amount < ctrl.account.limit;
    };
}]);