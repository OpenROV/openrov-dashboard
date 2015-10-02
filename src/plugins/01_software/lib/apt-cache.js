var Q = require('q');
var Lazy = require('lazy');

var AptCache = function(childProcess, preferences) {

  const INSTALLED = 'Installed:';
  const CANDIDATE = 'Candidate:';
  const VERSION_TABLE = 'Version table:';

  const KEYWORDS = [INSTALLED, CANDIDATE, VERSION_TABLE];

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

    var aptCacheProcess = childProcess.spawn('apt-cache', [
      'policy',
      packageName,
      '-t', preferences.selectedBranch
    ]);

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

    var aptCacheProcess = childProcess.spawn('apt-cache', [
      'policy',
      packageName,
      '-t', preferences.selectedBranch
    ]);

    var stdOut = "";
    var stdErr = '';

    aptCacheProcess.stdout.on('data', function(chunk) {
        stdOut += chunk;
    });

    aptCacheProcess.on('close', function(exitCode, undefined) {
      var result = parseStdOut(cleanPackageName, stdOut);

      policyResult.resolve({ result: result, error: stdErr, exitCode: exitCode });
    });

    return policyResult.promise;
  };

  function getBranch(line) {
    var parts = line.trim().split(' ');
    if (parts.length == 5) {
      return parts[2].split('/')[1];
    }
  }

  function getVersions(lineIndex, lines, packageName) {
    var versions = [];
    for (; lineIndex < lines.length; lineIndex++) {
      var line = lines[lineIndex].trim();
      if (line.indexOf(packageName) >= 0 || KEYWORDS.indexOf(line) >= 0) {
        lineIndex--; //step back in the lines;
        break;
      }
      var parts = line.split(' ');
      if ((parts.length == 3 && parts[0] == '***')
        || (parts.length == 2 && parts[0] != '100')) { //installed version
        var versionIndex = (parts.length == 3 && parts[0] == '***') ? 1 : 0;
        versions.push({ version: parts[versionIndex], branch: getBranch(lines[lineIndex+1]) });
        lineIndex = lineIndex + 1; // we parsed the next line already
      }
    }
    return { lineIndex: lineIndex, versions: versions };
  }

  function parseStdOut(packageName, output) {
    var lines = output.split("\n");
    var result = [];
    var lastPackage = {};
    var i;
    for(i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.trim().indexOf(packageName) == 0) {
        lastPackage = {package: line.trim().replace(':', ''), versions: [] };
        result.push(lastPackage);
      }
      else if (line.trim().indexOf(INSTALLED) == 0) {
        lastPackage.installed = line.replace(INSTALLED, '').trim();
        if (lastPackage.installed == '(none)') {
          lastPackage.installed = '';
        }
      }
      else if (line.trim().indexOf(CANDIDATE) == 0) {
        lastPackage.candidate = line.replace(CANDIDATE, '').trim();
      }
      else if (line.trim().indexOf(VERSION_TABLE) == 0) {
        i = i+1; //advance to the next line;
        var parsedVersions = getVersions(i, lines, packageName);
        i = parsedVersions.lineIndex;
        lastPackage.versions = parsedVersions.versions;
      }
    }
    return result;
  }

  return aptCache;
};
module.exports = AptCache;
