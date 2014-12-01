angular.module('Software.services', []).
  factory('softwareApiService', function($http, $q) {

    var software = {};

    software.loadInstalledSoftware = function(showIndividualPackages) {
      var packageName = "openrov-rov-suite*";
      if (showIndividualPackages) {
        packageName = "openrov-*";
      }
      return $http({
        method: 'GET',
        url: 'plugin/software/installed/' + packageName
      });
    };

    software.isUpdateEnabled = function() {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: 'plugin/software/config'
      })
        .then(
        function(result) {
          deferred.resolve(result.data.enableUpdates);
        },
        function() {
          deferred.resolve(false);
        });
      return deferred.promise;
    };

    software.enableUpdate = function() {
      $http({
        method: 'POST',
        url: 'plugin/software/config/enableUpdates/true'
      })
        .then(
          function() {
            console.log("Software updates successfully enabled.");
          },
          function(reason) {
            console.log("Could not enable Software updates. Reason: " + reason);
          }
        );
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
