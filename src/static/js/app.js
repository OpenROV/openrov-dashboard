$(function() {
  var socket = io.connect();
  var viewmodel;
  viewmodel = new DashboardViewModel(socket);
  var dashboard = new Dashboard(socket, viewmodel);

  console.log('Applying bindings');

});

angular.module('DashboardApp', [
  'DashboardApp.controllers',
  'DashboardApp.services',
  'DashboardApp.subModules',
  'ngRoute'
]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      otherwise({redirectTo: '/'});
  }]);
