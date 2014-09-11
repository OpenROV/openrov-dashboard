var dpkg = require('../../lib/dpkg')();
var AptCache = require('./lib/apt-cache');
var util = require('util');

module.exports = function(name, deps) {
  var app = deps.app;

  var aptCache = AptCache();

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

  this.ngModule = 'DashboardApp.Software';
  console.log("Loaded Services plugin");
  return this;
};