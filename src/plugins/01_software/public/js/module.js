angular.module('DashboardApp.Software', [
  'Software.controllers',
  'ui.router'
])
  .config(function($stateProvider) {
    $stateProvider
      .state('software', {
        url: '/software',
        templateUrl: 'plugin/01_software/plugin.html',
        controller: 'softwareController'
      });
  }
);

