var cp = require('child_process');
var Q = require('q');

var AptGet = function() {
  var aptGet = {};

  aptGet.update = function() {
    return Q.Promise( function(resolve, reject, notify) {
      var aptGetProcess = cp.spawn('apt-get', ['update']);
      handleClientProcess(aptGetProcess, resolve, reject, notify);
    });
  };

  aptGet.install = function(packageName, version, branch) {
    return Q.Promise(function(resolve, reject, notify) {
      var aptGetProcess = cp.spawn('apt-get',
        [
          '-y',
          '--force-yes',
          '-o Dpkg::Options::="--force-overwrite"',
          'install',
          '-t',
          branch,
            packageName+'='+version]);
      handleClientProcess(aptGetProcess, resolve, reject, notify);
    });
  };

  aptGet.configureBranches = function(branches) {

  };

  function handleClientProcess(aptGetProcess, resolve, reject, notify) {
    aptGetProcess.stdout.on('data', function(data) {
      notify({data: data});
    });
    aptGetProcess.stderr.on('data', function(data) {
      notify({error: data});
    });
    aptGetProcess.on('error', function (err) {
      notify({error: err});
    });
    aptGetProcess.on('exit', function(exitCode, signal) {
      if (exitCode == 0) {//success{
        resolve();
      }
      else { reject('Exit code: ' + exitCode + ' Signal: ' + signal); }
    })
  }

  return aptGet;
};
module.exports = AptGet;
