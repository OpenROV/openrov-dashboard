angular.module('DashboardApp.Services', [
  'Services.controllers',
  'ui.router'
])
  .config(function($stateProvider) {
    $stateProvider
      .state('services', {
        url: '/services',
        templateUrl: 'plugin/00_services/plugin.html',
        controller: 'servicesController'
      });
  }
);

