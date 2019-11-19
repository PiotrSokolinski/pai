var app = angular.module("app", ['ngRoute', 'ngAnimate', 'ui.bootstrap']);

app.value('globals', {
    alert: { text: "" }
});

app.constant('routes', [
	{ route: '/', templateUrl: '/html/home.html', controller: 'Default', controllerAs: 'ctrl' },
	{ route: '/1', templateUrl: '/html/1.html', controller: 'Ctrl1', controllerAs: 'ctrl' },
	{ route: '/2', templateUrl: '/html/2.html', controller: 'Ctrl2', controllerAs: 'ctrl' },
	{ route: '/3', templateUrl: '/html/3.html', controller: 'Ctrl3', controllerAs: 'ctrl' }
]);

app.config(['$routeProvider', '$locationProvider', 'routes', function($routeProvider, $locationProvider, routes) {
    $locationProvider.hashPrefix('');
	for(var i in routes) {
		$routeProvider.when(routes[i].route, routes[i]);
	}
	$routeProvider.otherwise({ redirectTo: '/' });
}]);

app.service('common', [ '$uibModal', 'globals', function($uibModal, globals) {

    this.confirm = function(confirmOptions, callback) {

        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title-top',
            ariaDescribedBy: 'modal-body-top',
            templateUrl: '/html/confirm.html',
            controller: 'Confirm',
            controllerAs: 'ctrl',
            resolve: {
                confirmOptions: function () {
                    return confirmOptions;
                }
            }
        });
        modalInstance.result.then(
            function () { callback(true); },
            function (ret) { callback(false); }
        );
    };

    this.showMessage = function(msg) {
        globals.alert.type = 'alert-success';
        globals.alert.text = msg;
    };

    this.showError = function(msg) {
        globals.alert.type = 'alert-danger';
        globals.alert.text = msg;
    };


}]);

app.controller("Ctrl", [ "$http", function($http) {
    var ctrl = this;
    
    const defCreds = { email: 'jim@beam.com', password: 'admin1' };

    var initVars = function() {
        ctrl.login = null;
        ctrl.creds = defCreds;
        ctrl.account = {};
        ctrl.historyCount = 0;
        ctrl.limit = 5;
        ctrl.filter = '';
        ctrl.transaction = { operation: "wi", amount: 0, description: "" };
        ctrl.message = '';
        $http.get('/login').then(
            function(rep) { ctrl.login = rep.data.email; },
            function(err) {}
        );
    };

    initVars();

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
                initVars();
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

    ctrl.doTransfer = function() {
        $http.post('/account', ctrl.transaction).then(
            function (rep) {
                ctrl.account = rep.data;
                ctrl.message = 'ok';
                if(ctrl.history.length >= ctrl.limit) {
                    ctrl.history.pop();
                }
                ctrl.history.unshift({
                    date: ctrl.account.lastOperation,
                    operation: ctrl.transaction.operation,
                    amount: ctrl.transaction.amount,
                    description: ctrl.transaction.description,
                    balance: ctrl.account.balance
                });
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
    };

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

app.controller("Default", function() {
    console.log('Default');
});