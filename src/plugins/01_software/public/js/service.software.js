var SoftwareApiService = [ '$http', '$q', function($http, $q) {

    var software = {};

    function getPackageName(showIndividualPackages) {
      var packageName = "openrov-rov-suite*";
      if (showIndividualPackages) {
        packageName = "openrov-*";
      }
      return packageName;
    }

    software.loadInstalledSoftware = function(showIndividualPackages) {
      return $http({
        method: 'GET',
        url: 'plugin/software/installed/' + getPackageName(showIndividualPackages)
      });
    };

    software.getUpdates = function(packageName) {
      return $http({
        method: 'GET',
        url: 'plugin/software/updates/' + packageName
      });
    };

    software.getPreviousVersions = function(showIndividualPackages) {
      return $http({
        method: 'GET',
        url: 'plugin/software/previous/' + getPackageName(showIndividualPackages)
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
  } ];