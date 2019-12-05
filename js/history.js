app.controller("History", [ '$http', '$scope', 'globals', function($http, $scope, globals) {
    var ctrl = this;
    ctrl.email = globals.email;
    
    var initVars = function() {
        ctrl.historyCount = 0;
        ctrl.limit = 5;
        ctrl.filter = '';
    };

    initVars();

    ctrl.refreshHistory = function() {
        $http.delete('/history').then(
            function(rep) { ctrl.historyCount = rep.data.count; },
            function(err) {}
        );
        var limit = ctrl.limit;
        if(limit <= 0) limit = 1;
        $http.get('/history?skip=0&limit=' + limit + '&filter=' + ctrl.filter).then(
            function(rep) { ctrl.history = rep.data; },
            function(err) {}
        );
    };

    ctrl.stamp2date = function(stamp) {
        return new Date(stamp).toLocaleString();
    };
    
    ctrl.refreshHistory();

    $scope.$on('transfer', function(event, obj) {
        ctrl.refreshHistory();
    });
}]);