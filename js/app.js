var app1 = angular.module("app1", []);

app1.controller("Ctrl1", [ "$http", function($http) {
    console.log("Kontroler 1");
    var ctrl = this;
    ctrl.konto = {};
    $http.get('/account').then(
        function (rep) { ctrl.konto = rep.data; },
        function (err) {}
    );
    ctrl.transakcja = { operation: "wi", amount: 0 };
    ctrl.message = '';
    ctrl.robTransakcje = function() {
        $http.post('/account', ctrl.transakcja).then(
            function (rep) {
                ctrl.konto = rep.data;
                ctrl.message = 'ok';
                ctrl.historia.push({ date: ctrl.konto.lastOperation, operation: ctrl.transakcja.operation, amount: ctrl.transakcja.amount, balance: ctrl.konto.balance});
            },
            function (err) { console.log(err); ctrl.message = err.data.error; }    
        );
    };
    ctrl.formInvalid = function() {
        var mnoznik = 0;
        switch(ctrl.transakcja.operation) {
            case 'wi': mnoznik = -1; break;
            case 'de': mnoznik = +1; break;
        }
        return ctrl.transakcja.amount <= 0 || ctrl.konto.balance + mnoznik * ctrl.transakcja.amount < ctrl.konto.limit;
    };
    $http.get('/history').then(
        function(rep) { ctrl.historia = rep.data; },
        function(err) {}
    );
    ctrl.stamp2date = function(stamp) {
        return new Date(stamp).toLocaleString();
    }
}]);