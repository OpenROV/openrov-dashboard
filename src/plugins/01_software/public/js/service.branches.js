angular.module('DashboardApp.services', []).
  factory('BranchesApiService', function($q, $http) {

    var software = {};

    software.getBranches = function() {
      return $http({
        method: 'GET',
        url: 'plugin/software/branches'
      });
    };

    return software;
  });