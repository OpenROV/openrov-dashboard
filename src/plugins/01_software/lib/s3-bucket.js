var AWS = require('aws-sdk');
var Q = require('q');

var Bucket = function() {

  var bucketName = { Bucket: 'openrov-deb-repository' };
  var s3 = new AWS.S3({ region: 'us-west-2', params: bucketName });

  var listBranches = Q.defer();

  this.getBranches = function() {
    s3.makeUnauthenticatedRequest('listObjects', {
      Prefix: 'dists/'
    }, function (err, data) {
      if (err) {
        listBranches.reject(err ? err.toString() : 'Unknown error');
      }
      else {
        var branches = [];
        data.Contents.forEach(function (item) {
          var parts = item.Key.split("/");
          if (branches.indexOf(parts[1]) === -1) {
            branches.push(parts[1]);
          }
        });
        listBranches.resolve(branches);
      }
    });
    return listBranches.promise;
  }
  return this;
};

module.exports = Bucket;
