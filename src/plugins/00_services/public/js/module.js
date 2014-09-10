angular.module('DashboardApp.Services', [
  'ngRoute'
])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when(
        "/services",
        { templateUrl: "plugin/00_services/plugin.html", controller: "servicesController" }
      );
    }]
  );
