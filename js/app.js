var app1 = angular.module("app1", []);

app1.controller("Ctrl1", [ "$http", function($http) {
    console.log("Kontroler 1");
    var ctrl = this;
    ctrl.konto = {};
    $http.get('/konto').then(
        function (rep) { ctrl.konto = rep.data; },
        function (err) {}
    );
    ctrl.transakcja = { operacja: "wy", kwota: 0 };
    ctrl.message = '';
    ctrl.robTransakcje = function() {
        $http.post('/konto', ctrl.transakcja).then(
            function (rep) { ctrl.konto = rep.data; ctrl.message = 'ok'; },
            function (err) { console.log(err); ctrl.message = err.data.error; }    
        );
    };
    ctrl.formInvalid = function() {
        var mnoznik = 0;
        switch(ctrl.transakcja.operacja) {
            case 'wy': mnoznik = -1; break;
            case 'wp': mnoznik = +1; break;
        }
        return ctrl.transakcja.kwota <= 0 || ctrl.konto.saldo + mnoznik * ctrl.transakcja.kwota < ctrl.konto.limit;
    };
}]);