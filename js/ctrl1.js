app.controller("Ctrl1", [ "common", function(common) {
    console.log('Ctrl1');
    common.confirm({
        title: 'Confirm',
        body: 'Are you going to make sth?'
    }, function (answer) {});
}]);