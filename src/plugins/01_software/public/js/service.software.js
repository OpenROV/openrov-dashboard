angular.module('Software.services', []).
  factory('softwareApiService', function($http) {

    var software = {};

    software.loadInstalledSoftware = function() {
      return $http({
        method: 'GET',
        url: 'plugin/software/installed/openrov-*'
      });
    };

    software.getLatestVersions = function(packageName, branch, onlyUpdates) {
      return $http({
        method: 'GET',
        url: 'plugin/software/latestversion/' + packageName + '/' + branch + '/' + onlyUpdates
      });
    };

/*
    software.getInstallCandidate = function(packageName) {
      return $http({
        method: 'GET',
        url: 'plugin/software/installCandidate/' + packageName
      });
    };
*/

    software.install = function(packageName, version, branch) {
      return $http({
        method: 'POST',
        url: 'plugin/software/install/' + packageName + '/' + version + '/' + branch
      });
    };

    return software;
  });
