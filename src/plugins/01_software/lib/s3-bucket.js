var AWS = require('aws-sdk');
var Q = require('q');

var Bucket = function(config) {

  var bucketName = { Bucket: config.aws.bucket };
  var s3 = new AWS.S3({ region: config.aws.region, params: bucketName });

  var proxy = config.proxy;
  if (proxy) {
    console.log("Using proxy: " + proxy + " for AWS S3 connection.");
    AWS.config.update({
      httpOptions: {
        proxy: proxy
      }
    });
  }

  this.getBranches = function() {

    var listBranches = Q.defer();
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
  };
  return this;
};

module.exports = Bucket;
