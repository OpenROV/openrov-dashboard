var cp = require('child_process');
var Lazy = require('lazy');

var AptGet = function() {
  var aptGet = {};
  aptGet.install = function(packageName, version, branch, callback) {
    var aptGetProcess = cp.spawn('apt-get',
      ['install', '-t', branch, packageName+'='+version]);

    var stdOut = '';
    var stdErr = '';
    Lazy(aptGetProcess.stdout).lines.map(String)
      .join(function(items) { stdOut = items.join('\n') });
    Lazy(aptGetProcess.stderr).lines.map(String)
      .join(function(items) { stdErr = items.join('\n') });

    aptGetProcess.on('close', function(exitCode, undefined) {
      callback({ stdOut: stdOut, stdErr: stdErr, exitCode: exitCode });
    });
  };
  return aptGet;
};
module.exports = AptGet;
