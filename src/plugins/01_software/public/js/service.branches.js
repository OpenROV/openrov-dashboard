angular.module('DashboardApp.services', []).
  factory('BranchesApiService', function($q, $http) {

    var software = {};

    software.getBranches = function() {

      var deferred = $q.defer();

      getBranchesFromS3(function(branches) {
        deferred.resolve(branches);
      });
      return deferred.promise;
    };

    function getBranchesFromS3(callback) {
      var branches = [];
      var bucketName = { Bucket: 'openrov-deb-repository' };
      var s3 = new AWS.S3({ region: 'us-west-2', params: bucketName });
      s3.makeUnauthenticatedRequest('listObjects', {
        Prefix: 'dists/'
      }, function (err, data) {
        if (err) {
          alert(err); //TODO fix error handling
        }
        else {
          data.Contents.forEach(function(item) {
            var parts = item.Key.split("/");
            if (branches.indexOf(parts[1]) === -1) {
              branches.push(parts[1]);
            }
          });
        }
        callback(branches);
      });
    }

    return software;
  });