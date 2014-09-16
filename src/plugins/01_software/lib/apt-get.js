var cp = require('child_process');
var Q = require('q');
var FS = require("fs");
var PATH = require('path');

var AptGet = function(config) {
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
    FS.readdir(config.aptGetSourcelists, function(err, files){
      if (err) { console.error("Error while reading directory: " + err)}
      else {
        files.forEach(
          function(file) {
            if (file.indexOf('openrov-') == 0) {
              var start = file.indexOf('-');
              var end = file.indexOf('.');
              var branchName = file.substring(start + 1, end);
              if (branches.filter(function (branch) {
                return branch === branchName
              }).length === 0) {
                FS.unlinkSync(PATH.join(config.aptGetSourcelists, file));
              }
            }
          });
        branches.forEach(function(branch) {
          var path = PATH.join(config.aptGetSourcelists, 'openrov-' + branch + '.list');
          if (!FS.existsSync(path)) {
            var content = 'deb http://build.openrov.com/debian/ ' + branch + ' debian';
            FS.writeFile(path, content, function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log("The file was saved!");
              }
            });
          }
        });
      }
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
