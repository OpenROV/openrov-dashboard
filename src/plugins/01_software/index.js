var aptGet = require('./lib/apt-get')();
var packageManager = require('./lib/package-manager')();
var util = require('util');

module.exports = function(name, deps) {
  var app = deps.app;
  var aptGetUpdate = {running: false};
  var aptGetInstall = {running: false};
  var socket = { emit: function(string, data) { console.log('shouldn\'t go here!'); }, broadcast: { emit: function() { console.log('shouldn\'t go here!'); } }};
  var getSocket = function() { return socket; };

  deps.io.on('connection', function (newSocket) {
    socket = newSocket;
    console.log('Socket io connected()');
    socket.on('Software.Cockpit.answer', emitOnIpc);
  });

  var ipcSocket = deps.io.of('/IPC');
  ipcSocket.on('connection', function (newIpcSocket) {
    console.log('IPC Socket io connected()');

    newIpcSocket.on('Software.Cockpit.message', function(message) {
      deps.io.sockets.emit('Software.Cockpit.message', message);
    });
  });

  function emitOnIpc(message){
    ipcSocket.emit('Software.Cockpit.answer', message);
  }

  app.post(
    '/plugin/software/update/start',
    function(req, resp) {
      if (aptGetUpdate.running) {
        resp.redirect(301,'/plugin/software/update/status');
        resp.send(aptGetUpdate);
        resp.end();
      }
      else {
        aptGetUpdate = { promise: aptGet.update(), running:true, data: [], error: [] };
        aptGetUpdate.promise.then(
          function() {
            aptGetUpdate.running = false;
            aptGetUpdate.success = true;
            aptGetUpdate.lastUpdate = Date.now();
            getSocket().emit('Software.Update.done', aptGetUpdate);
          },
          function(reason) {
            aptGetUpdate.success = false;
            aptGetUpdate.running = false;
            aptGetUpdate.error.push(reason);
            aptGetUpdate.lastUpdate = Date.now();
            getSocket().emit('Software.Update.done', aptGetUpdate);
          },
          function(information) {
            if (information.data) {
              aptGetUpdate.data.push(information.data.toString());
            }
            if (information.error) {
              aptGetUpdate.error.push(information.error.toString());
            }
            getSocket().emit('Software.Update.update', aptGetUpdate);
          }
        )
      }
      returnState(aptGetUpdate, resp);
    }
  );

  app.get(
    '/plugin/software/update/status',
    function (req, resp) {
      returnState(aptGetUpdate, resp);
    }
  );

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
    '/plugin/software/install/start/:packageName/:version/:branch',
    function(req, resp) {
      if (aptGetInstall.running) {
        resp.redirect(301,'/plugin/software/install/status');
        resp.send(aptGetInstall);
        resp.end();
      }
      else {
        aptGetInstall = {
          promise: aptGet.install(req.params.packageName, req.params.version, req.params.branch),
          running: true,
          data: [],
          error: []
        };
        aptGetInstall.promise.then(
          function() {
            console.log("##########");
            aptGetInstall.running = false;
            aptGetInstall.success = true;
            aptGetInstall.lastUpdate = Date.now();
            getSocket().emit('Software.Install.done', aptGetInstall);
          },
          function(reason) {
            console.log("@@@@@@@@@@@@@@" + reason);
            aptGetInstall.success = false;
            aptGetInstall.running = false;
            aptGetInstall.error.push(reason);
            aptGetInstall.lastUpdate = Date.now();
            getSocket().emit('Software.Install.done', aptGetInstall);
          },
        function(information) {
          console.log("$$$$$$$$" + JSON.stringify( information.data.toString()));
          aptGetInstall.data.push(information.data.toString());
            if (information.error) {
              aptGetInstall.error.push(information.error.toString());
            }
            getSocket().emit('Software.Install.update', aptGetInstall);
          }
        )
      }
      returnState(aptGetInstall,resp);
    });

  app.get(
    '/plugin/software/install/status',
    function (req, resp) {
      console.log("__________");
      returnState(aptGetInstall, resp);
    }
  );

  function returnState(process, resp) {
    resp.statusCode = process.running ? 206 : 200;
    resp.send(process);
    resp.end();
  }

  var result = { ngModule: 'DashboardApp.Software' };
  console.log("Loaded software plugin");
  return result;
};