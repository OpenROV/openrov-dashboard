var dpkg = require('../../lib/dpkg')();

module.exports = function(name, deps) {
  var app = deps.app;

  app.get(
    '/plugin/software/installed',
    function(req, resp) {
      dpkg.packagesAsync(function(items) {
        resp.send(items);
      });
    }
  );

  this.ngModule = 'DashboardApp.Software';
  console.log("Loaded Services plugin");
  return this;
};