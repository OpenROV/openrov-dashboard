angular.module('Software.services', []).
  factory('softwareApiService', function($http) {

    var software = {};

    software.loadInstalledSoftware = function() {
      return $http({
        method: 'GET',
        url: 'plugin/software/installed/'
      });
    };

    software.getLatestVersion = function(packageName) {
      return $http({
        method: 'GET',
        url: 'plugin/software/latestversion/' + packageName
      });
    };

    return software;
  });
