app.controller("History", [ '$http', function($http) {
    var ctrl = this;
    
    var initVars = function() {
        ctrl.historyCount = 0;
        ctrl.limit = 5;
        ctrl.filter = '';
    };

    initVars();

    var refreshHistoryCount = function() {
        $http.delete('/history').then(
            function(rep) { ctrl.historyCount = rep.data.count; },
            function(err) {}
        );
    };

    var refreshAll = function() {
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