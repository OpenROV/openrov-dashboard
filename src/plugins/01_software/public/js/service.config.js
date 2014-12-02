var ConfigService = ['$q', '$http', function($q, $http) {
  var config = {};

  config.isUpdateEnabled = function() {
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

  return config;
}];