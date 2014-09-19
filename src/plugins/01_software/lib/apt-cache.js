var cp = require('child_process');
var Lazy = require('lazy');

var AptCache = function() {
  var aptCache = {};
    aptCache.madison = function(arguments, callback) {
      var aptCacheProcess = cp.spawn('apt-cache', ['madison'].concat(arguments));

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

  aptCache.genCaches = function(callback) {
    var aptCacheProcess = cp.spawn('apt-cache', ['gencaches']);

    var stdOut = '';
    var stdErr = '';
    var result = '';
    var candidate = 'Candidate:';
    Lazy(aptCacheProcess.stdout).lines.map(String)
      .join(function(lines) {
        result = lines.join('\n');
      });
    Lazy(aptCacheProcess.stderr).lines.map(String)
      .join(function(items) { stdErr = items.join('\n') });

    aptCacheProcess.on('close', function(exitCode, undefined) {
      callback({ result: result, error: stdErr, exitCode: exitCode });
    });
  };

  aptCache.getCandidates = function(packageName, callback) {
    var cleanPackageName = packageName.replace('*', '');
    var aptCacheProcess = cp.spawn('apt-cache', ['policy', packageName]);

    var stdOut = '';
    var stdErr = '';
    var result = [];
    var candidate = 'Candidate:';
    Lazy(aptCacheProcess.stdout).lines.map(String)
      .filter(function(line) {
        return ((line.indexOf(cleanPackageName) === 0) ||
            (line.trim().indexOf(candidate) === 0));
      })
      .join(function(lines) {
        var packageName = '';
        var version = '';
        lines.forEach(function(line) {
          if (line.indexOf(cleanPackageName) === 0) {
            packageName = line.substring(0, line.indexOf(':'));
          }
          var candidateIndex = line.trim().indexOf(candidate);
          if (candidateIndex === 0) {
            version = line.trim().substring(candidate.length + 1);
            result.push({package: packageName, version: version});
            packageName = '';
            version = '';
          }
        })
      });
    Lazy(aptCacheProcess.stderr).lines.map(String)
      .join(function(items) { stdErr = items.join('\n') });

    aptCacheProcess.on('close', function(exitCode, undefined) {
      callback({ result: result, error: stdErr, exitCode: exitCode });
    });

  };
  return aptCache;
};
module.exports = AptCache;
