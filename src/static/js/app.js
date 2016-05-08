var __dashboard;
var __socket;
$(function() {
  __socket = io.connect(window.location.protocol + '//' +
                 window.location.hostname+ ':' +  window.location.port,{path:'/dashboardsocket'});
  __dashboard  = new Dashboard(__socket);

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
  .value('DashboardAccess', function() { return __dashboard  })
  .value('SocketAccess', function() { return __socket; });
