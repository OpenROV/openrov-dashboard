angular.module('Software.services', []).
  factory('softwareApiService', function($http) {

    var software = {};

    software.loadInstalledSoftware = function() {
      return $http({
        method: 'GET',
        url: 'plugin/software/installed/openrov-rov-suite*'
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
        url: 'plugin/software/install/start/' + packageName + '/' + version + '/' + branch
      });
    };

    software.installStatus = function() {
      return $http({
        method: 'get',
        url: 'plugin/software/install/status'
      });
    };

    software.getBbSerial = function() {
      return $http({
        method: 'GET',
        url: 'plugin/software/bbserial'
      });
    };

    return software;
  })
  .factory('reportingService', function($http) {
    var reporting = {};

    reporting.report = function (istalledPackages, rovInformation, location) {
      return $http({
        method: 'POST',
        url: 'http://build.openrov.com/reporting/reportRov',
        data: {installedPackages: istalledPackages, rovInformation: rovInformation, location: location}
      });
    };
    return reporting;
  });
