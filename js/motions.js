app.controller('Motions', [ '$http', 'common', function($http, common) {
    var ctrl = this;
    ctrl.email = globals.email;
    
    var initVars = function() {
        ctrl.motionsCount = 0;
        ctrl.motionsLimit = 5;
        ctrl.motionsFilter = '';
    };

    initVars();

    ctrl.refreshMotions = function() {
        $http.delete('/motions').then(
            function(rep) { ctrl.historyCount = rep.data.count; },
            function(err) {}
        );
        console.log('!!!!123123123121321231231233112312312313213212313212')
        var limit = ctrl.limit;
        if(limit <= 0) limit = 1;
        $http.get('/motions?skip=0&limit=' + limit + '&filter=' + ctrl.filter).then(
            function(rep) { ctrl.motions = rep.data; },
            function(err) {}
        );
    };

    // ctrl.stamp2date = common.stamp2date;
    
    ctrl.refreshMotions();

    // $scope.$on('transfer', function(event, obj) {
    //     ctrl.refreshMotions();
    // });
}]);