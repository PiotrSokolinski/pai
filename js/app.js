var app1 = angular.module("app1", []);

app1.controller("Ctrl1", [ "$http", function($http) {
    console.log("Kontroler 1");
    var ctrl = this;
    ctrl.konto = {};
    $http.get('/konto').then(
        function (rep) { ctrl.konto = rep.data; },
        function (err) {}
    );
}]);