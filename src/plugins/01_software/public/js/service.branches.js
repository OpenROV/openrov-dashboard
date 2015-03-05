var BranchesApiService = ['$q', '$http', function($q, $http) {

    var software = {};

    software.getBranches = function() {
      return $http({
        method: 'GET',
        url: 'plugin/software/branches'
      });
    };

    return software;
  }];