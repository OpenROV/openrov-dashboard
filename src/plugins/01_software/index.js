var aptCache = require('./lib/apt-cache')();
var aptGet = require('./lib/apt-get')();
var packageManager = require('./lib/package-manager')();
var util = require('util');

module.exports = function(name, deps) {
  var app = deps.app;

  app.get(
    '/plugin/software/installed/:packageName',
    function (req, resp) {
      var packageName = req.params.packageName;
      if (!(packageName) || packageName.trim().lenght === 0) {
        packageName = 'openrov-*'
      }
      packageManager.getInstalledPackages(packageName, function (items) {
        resp.send(items);
      });
    }
  );

  app.get(
    '/plugin/software/packages/updates/:packageName/:branch',
    function (req, resp) {
      packageManager.loadVersions(
        req.params.packageName,
        req.params.branch,
          true, true)
        .then(function(items) {
          resp.send(items);
        },
        function(reason){
          resp.statusCode = 400;
          resp.end(reason);
        })
    });

  app.get(
    '/plugin/software/packages/all/:packageName/:branch/:onlyLatest',
    function (req, resp) {
      packageManager.loadVersions(
        req.params.packageName,
        req.params.branch,
          false, // updates only
          req.params.onlyLatest === 'true')
        .then(function(items) {
          resp.send(items);
        },
        function(reason){
          resp.statusCode = 400;
          resp.end(reason);
        })
    });

  app.post(
    '/plugin/software/install/:packageName/:version/:branch',
    function (req, resp) {
      aptGet.install(req.params.packageName, req.params.version, req.params.branch,
      function(result) {
        if (result.exitCode == 0) {
          resp.send({ success: true, result: result.stdOut });
        }
        else {
          resp.send({ success: false, result: result.stdOut, error: result.stdErr });
        }
      });
    });

  app.get(
    '/plugin/software/installCandidate/:packageName',
    function (req, resp) {
      aptCache.getCandidates(req.params.packageName,
        function(result) {
          if (result.exitCode === 0) {

            resp.send({ success: true, result: result.result});
          }
          else { resp.send({ success: false, error: result.error})}
        })
    }
  );

  var result = { ngModule: 'DashboardApp.Software' };
  console.log("Loaded software plugin");
  return result;
};