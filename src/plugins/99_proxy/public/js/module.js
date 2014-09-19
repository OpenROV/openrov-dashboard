angular.module('DashboardApp.Proxy', [
  'ui.router'
])
  .config(function($stateProvider) {
    $stateProvider
      .state('proxy', {
        url: '/proxy',
        templateUrl: 'plugin/99_proxy/plugin.html',
        controller: 'proxyController'
      });

    $('body').append('<div id="proxy-container"  class="col-lg-12"><iframe  class="col-lg-12" style="height: 300px" src="http://' + window.location.hostname + ':3000"></iframe></div>');
    $('#proxy-container').hide();

  }
).controller('proxyController', function($scope) {
    $scope.$on('$viewContentLoaded', function(){
      $('#proxy-container')
        .appendTo('#proxy')
        .show();

    });
    $scope.$on('$destroy', function() {
      $('#proxy-container')
        .hide()
        .appendTo('body');
    });

  });

