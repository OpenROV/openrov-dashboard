var Q = require('q');
var Lazy = require('lazy');

var AptCache = function(childProcess) {

  var aptCache = {};
    aptCache.madison = function(arguments, callback) {
      var aptCacheProcess = childProcess.spawn('apt-cache', ['madison'].concat(arguments));

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
    var aptCacheProcess = childProcess.spawn('apt-cache', ['gencaches']);

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
    var aptCacheProcess = childProcess.spawn('apt-cache', ['policy', packageName]);

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

  aptCache.policy = function(packageName){
    var policyResult = Q.defer();
    var cleanPackageName = packageName.replace('*', '');
    var aptCacheProcess = childProcess.spawn('apt-cache', ['policy', packageName]);

    var stdOut = "";
    var stdErr = '';

    aptCacheProcess.stdout.on('data', function(chunk) {
        stdOut += chunk;
    });

    aptCacheProcess.on('close', function(exitCode, undefined) {
      var result = parseStdOut(packageName, stdOut);

      policyResult.resolve({ result: result, error: stdErr, exitCode: exitCode });
    });

    return policyResult.promise;
  };

  function parseStdOut(packageName, output) {
    var lines = output.split("\n");
    var result = [];
    const INSTALLED = 'Installed: ';
    const CANDIDATE = 'Candidate: ';
    var lastPackage = undefined;
    lines.forEach(function(line) {
      if (line.trim().indexOf(packageName) == 0) {
        lastPackage = {package: line.trim().replace(':', '') };
        result.push(lastPackage)
      }
      else if (line.trim().indexOf(INSTALLED) == 0) {
        lastPackage.installed = line.trim().replace(INSTALLED, '');
      }
      else if (line.trim().indexOf(CANDIDATE) == 0) {
        lastPackage.candidate = line.trim().replace(CANDIDATE, '');
      }
    });
    return result;
  }

  return aptCache;
};
module.exports = AptCache;
