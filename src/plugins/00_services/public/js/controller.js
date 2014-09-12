angular.module('Services.controllers', []).
  controller('servicesController', function($scope, DashboardAccess) {
    $scope.$on('$viewContentLoaded', function(){
      $('#services')
        .show()
        .appendTo('#services-plugin-container');

      $scope.refreshIntervall = setInterval(
        function() {
          DashboardAccess().socket.emit('services.refresh');
        },
        5000
      );

    });
    $scope.$on('$destroy', function() {
      clearInterval($scope.refreshIntervall);
      $('#services')
        .hide()
        .appendTo('body');
      });
  });
