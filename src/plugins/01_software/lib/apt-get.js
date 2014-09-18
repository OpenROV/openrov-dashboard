var cp = require('child_process');
var Q = require('q');
var FS = require("q-io/fs");

var AptGet = function(config) {
  var aptGet = {};

  aptGet.update = function() {
    return Q.Promise( function(resolve, reject, notify) {
      var aptGetProcess = cp.spawn('apt-get', [
        'update',
        '-o', 'Dir::Etc::sourcelist=/dev/zero',
        '-o', 'Dir::Etc::sourceparts=/etc/apt/sources.list.d/'
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
          '-t',
          branch,
            packageName+'='+version]);
      handleClientProcess(aptGetProcess, resolve, reject, notify);
    });
  };

  aptGet.configureBranches = function(branches) {
    return FS.list(config.aptGetSourcelists)
      .then(function(files) {
        files.forEach(
          function (file) {
            if (file.indexOf('openrov-') == 0) {
              var start = file.indexOf('-');
              var end = file.indexOf('.');
              var branchName = file.substring(start + 1, end);
              if (branches.filter(function (branch) {
                return branch === branchName
              }).length === 0) {
                var path = FS.join(config.aptGetSourcelists, file);
                return FS.remove(path)
                  .then(function() {console.log('Removed ' + path)});
              }
            }
          })
        return Q.Promise(function () {
          branches.forEach(function (branch) {
            var path = FS.join(config.aptGetSourcelists, 'openrov-' + branch + '.list');
            return FS.exists(path).then(function (exists) {
              if (!exists) {
                var content = 'deb http://build.openrov.com/debian/ ' + branch + ' debian';
                return FS.write(path, content)
                  .then(function() {
                    console.log("Wrote file " + path);
                  });
              }
            })
          });
        });
      }).then(function() {
      })
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
