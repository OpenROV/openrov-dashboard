angular.module('Software.services', []).
  factory('softwareApiService', function($http) {

    var software = {};

    software.loadInstalledSoftware = function() {
      return $http({
        method: 'JSON',
        url: 'plugin/software/installed/'
      });
    };

    return software;
  });
