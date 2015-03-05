var cp = require('child_process');
var Q = require('q');
var FS = require("q-io/fs");

var AptGet = function(config) {
  var aptGet = {};

  aptGet.update = function() {
    return Q.Promise( function(resolve, reject, notify) {
      var sourceList = 'Dir::Etc::sourcelist=/dev/zero';
      var sourceParts = 'Dir::Etc::SourceParts=' + config.aptGetSourcelists + '/';
      console.log('Starting apt-get update child process ' + sourceList);
      var aptGetProcess = cp.spawn('apt-get', [
        'update',
        '-o', sourceList,
        '-o', sourceParts
      ]);
      handleClientProcess(aptGetProcess, resolve, reject, notify);
    });
  };

  aptGet.install = function(packageName, version, branch) {
    return Q.Promise(function(resolve, reject, notify) {
      var aptGetProcess = cp.spawn('apt-get',
        [
          '-y',
          '--force-yes',
          '-o', 'Dpkg::Options::=--force-overwrite',
          'install',
            packageName+'='+version]);
      handleClientProcess(aptGetProcess, resolve, reject, notify);
    });
  };

  aptGet.getBranches = function() {
    return Q.Promise(function(resolve) {
      FS.list(config.aptGetSourcelists)
        .then(function(files) {
          var branches = [];
          files.forEach(
            function (file) {
              if (file.indexOf('openrov-') == 0) {

                var start = file.indexOf('-');
                var end = file.indexOf('.');
                var branchName = file.substring(start + 1, end);
                branches.push(branchName);
              }
            });
          resolve(branches);
        });
    });
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

