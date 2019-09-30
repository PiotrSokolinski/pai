var app1 = angular.module("app1", []);

app1.controller("Ctrl1", [ "$http", function($http) {
    console.log("The first controller");
}]);