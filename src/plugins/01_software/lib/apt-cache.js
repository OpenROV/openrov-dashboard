var cp = require('child_process');
var Lazy = require('lazy');

var AptCache = function() {
  var aptCache = {};
    aptCache.madison = function(arguments, callback) {
      var aptCacheProcess = cp.spawn('apt-cache', ['madison'].concat(arguments));

      // TODO Error handling
      var input = Lazy(aptCacheProcess.stdout).lines.map(String).map(function (line) {
        var fields = line.trim().split('|');
        var source = fields[2].trim().split(' ');
        var branch = '';
        if (source && source.length >= 2) {
          branch = source[1].split('/')[0];
        }
        return {
          package: fields[0].trim(),
          version: fields[1].trim(),
          url: fields[2].trim(),
          branch: branch

        };
      });
      input.join(function(items) {
        callback(items); });
    };
  return aptCache;
};
module.exports = AptCache;
