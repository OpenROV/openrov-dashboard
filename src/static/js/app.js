var __dashboard;
$(function() {
  var socket = io.connect();
  var viewmodel;
  __dashboard  = new Dashboard(socket, viewmodel);

});

angular.module('DashboardApp', [
  'DashboardApp.controllers',
  'DashboardApp.services',
  'DashboardApp.subModules',
  'ui.router'
])
  .config(function($urlRouterProvider) {
    $urlRouterProvider.otherwise('/services');
  })
  .value('DashboardAccess', function() { return __dashboard  });;

