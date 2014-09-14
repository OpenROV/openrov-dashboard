angular.module('Software.services', []).
  factory('softwareApiService', function($http) {

    var software = {};

    software.loadInstalledSoftware = function() {
      return $http({
        method: 'GET',
        url: 'plugin/software/installed/openrov-*'
      });
    };

    software.getUpdates = function(packageName, branch) {
      return $http({
        method: 'GET',
        url: 'plugin/software/packages/updates/' + packageName + '/' + branch
      });
    };

    software.getAll = function(packageName, branch, onlyLatest) {
      return $http({
        method: 'GET',
        url: 'plugin/software/packages/all/' + packageName + '/' + branch + '/' + onlyLatest
      });
    };

    software.getLatestVersions = function(packageName, branch, onlyUpdates) {
      return $http({
        method: 'GET',
        url: 'plugin/software/latestversion/' + packageName + '/' + branch + '/' + onlyUpdates
      });
    };

    software.startAptUpdate = function() {
      return $http({
        method: 'POST',
        url: 'plugin/software/update/start'
      });
    };

    software.aptUpdateStatus = function() {
      return $http({
        method: 'get',
        url: 'plugin/software/update/status'
      });
    };

    software.install = function(packageName, version, branch) {
      return $http({
        method: 'POST',
        url: 'plugin/software/install/' + packageName + '/' + version + '/' + branch
      });
    };

    return software;
  });
