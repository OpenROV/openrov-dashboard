angular.module('DashboardApp.Software', [
  'ngRoute'
])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when(
      "/software",
      { templateUrl: "plugin/01_software/plugin.html", controller: "softwareController" }
    );
  }]
);
