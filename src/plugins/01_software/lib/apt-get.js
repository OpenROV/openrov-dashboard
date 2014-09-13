var cp = require('child_process');
var Lazy = require('lazy');
var Q = require('q');

var AptGet = function() {
  var aptGet = {};

  aptGet.update = function() {
    return Q.Promise( function(resolve, reject, notify) {
      var aptGetProcess = cp.spawn('apt-get', ['update']);
      aptGetProcess.stdout.on('data', function(data) {
        notify({data: data});
      });
      aptGetProcess.stderr.on('data', function(data) {
        notify({error: data});
      });
      aptGetProcess.on('error', function (err) {
        notify({error: error});
      });
      aptGetProcess.on('exit', function(exitCode, signal) {
        if (exitCode == 0) {//success{
          resolve();
        }
        else { reject() }
      })
    });
  };

  aptGet.install = function(packageName, version, branch, callback) {
    var aptGetProcess = cp.spawn('apt-get',
      [
        '-y',
        '--force-yes',
        '-o Dpkg::Options::="--force-overwrite"',
        'install',
        '-t',
        branch,
          packageName+'='+version]);

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
