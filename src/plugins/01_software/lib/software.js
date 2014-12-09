var Q = require('q');

var Software = function(packageManager) {
  var self = this;

  self.getUpdates = function(branches) {
    return Q.fcall(function() {
      var promises = [];
      var updates = [];
      branches.forEach(function(branch) {
        promises.push(
          packageManager.loadVersions(
            'openrov-*',
            branch, true, true)
        )});
      return Q.allSettled(promises)
        .then(function(results) {
          results.forEach(function (result) {
            if (result.state === "fulfilled") {
              updates = updates.concat(result.value);
            }
          });
          return updates;
        });
    });
  };
  return self;

};

module.exports = Software;
