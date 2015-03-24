angular.module('DashboardApp.Software', [
  'Software.controllers',
  'ui.router',
  'cgBusy'
])
  .config(function($stateProvider, $sceDelegateProvider) {
    $stateProvider
      .state('software', {
        url: '/software',
        templateUrl: 'plugin/01_software/plugin.html',
        controller: 'softwareController'
      });

      $sceDelegateProvider
        .resourceUrlWhitelist(
        ['self', 'http://deb-repo.openrov.com/**']);
  })
  .value('cgBusyDefaults',{
    message:'Loading...',
    backdrop: true,
    templateUrl: 'plugin/01_software/loading.template.html',
    delay: 50,
    minDuration: 700
  });
