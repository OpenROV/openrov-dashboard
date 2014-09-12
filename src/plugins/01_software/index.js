var dpkg = require('../../lib/dpkg')();
var aptCache = require('./lib/apt-cache')();
var aptGet = require('./lib/apt-get')();
var util = require('util');

module.exports = function(name, deps) {
  var app = deps.app;


  app.get(
    '/plugin/software/installed',
    function (req, resp) {
      dpkg.packagesAsync(function (items) {
        resp.send(items);
      });
    }
  );

  app.get(
    '/plugin/software/latestversion/:packageName',
    function (req, resp) {
      aptCache.madison([req.params.packageName], function(items) {
        resp.send(items);
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

  this.ngModule = 'DashboardApp.Software';
  console.log("Loaded software plugin");
  return this;
};