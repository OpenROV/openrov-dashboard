angular.module('DashboardApp.Software', [
  'Software.controllers',
  'ui.router',
  'cgBusy'
])
  .config(function($stateProvider) {
    $stateProvider
      .state('software', {
        url: '/software',
        templateUrl: 'plugin/01_software/plugin.html',
        controller: 'softwareController'
      });
    }
  ).value('cgBusyDefaults',{
    message:'Loading...',
    backdrop: true,
    templateUrl: 'plugin/01_software/loading.template.html',
    delay: 50,
    minDuration: 700
  });

