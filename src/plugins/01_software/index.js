module.exports = function(name, deps) {
  var app = deps.app;

  app.get(
    '/plugin/software/installed',
    function(req, resp) {
      var installed = [
        { name: "openrov-software-1.0" },
        { name: "openrov-software-dashboard-1.0" },
      ];
      resp.send(installed);
    }
  );

};