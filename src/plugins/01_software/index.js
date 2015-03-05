var cp = require('child_process');
var AptCache = require('./lib/apt-cache');
var AptGet = require('./lib/apt-get');
var Dpkg = require('./lib/dpkg');
var PackageManager = require('./lib/package-manager');
var Software = require('./lib/software');
var Preferences = require('./lib/preferences');
var Q = require('q');
var util = require('util');
var showSerialScript = __dirname + '/scripts/' + (process.env.USE_MOCK === 'true' ? 'mock-' : '') + 'showserial.sh';

module.exports = function(name, deps) {
  var app = deps.app;
  var dpkg = new Dpkg();
  var preferences = new Preferences(function() { return deps.config; });
  var aptGet = new AptGet(deps.config);
  var aptCache = new AptCache(cp, preferences);
  var packageManager = new PackageManager(dpkg, aptCache, aptGet);
  var software = new Software(packageManager);

  var aptGetUpdate = {running: false};
  var aptGetInstall = {running: false};
  var socket = { emit: function(string, data) { console.log('shouldn\'t go here!'); }, broadcast: { emit: function() { console.log('shouldn\'t go here!'); } }};
  var getSocket = function() { return socket; };

  deps.io.on('connection', function (newSocket) {
    socket = newSocket;
    console.log('Socket io connected()');
  });

  app.post(
    '/plugin/software/update/start',
    function(req, resp) {
      if (aptGetUpdate.running) {
        resp.redirect(301,'/plugin/software/update/status');
        resp.end();
      }
      else {
        startAptGetUpdate();
        returnState(aptGetUpdate, resp);
      }
    }
  );

  app.get(
    '/plugin/software/updates/:packageName',
    function(req, resp) {
      packageManager.getUpdates(req.params.packageName, preferences.selectedBranch)
        .then(function(result) {
          resp.status(200);
          resp.send(result);
        });
    }
  );

  app.get(
    '/plugin/software/previous/:packageName',
    function(req, resp) {
      packageManager.getPreviousVersions(req.params.packageName, preferences.selectedBranch)
        .then(function(result) {
          console.log(JSON.stringify(result));
          resp.status(200);
          resp.send(result);
        });
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
      packageManager.getInstalledPackages(packageName)
        .then(function (items) {
          resp.send(items);
        });
    }
  );

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
            aptGetInstall.running = false;
            aptGetInstall.success = true;
            aptGetInstall.lastUpdate = Date.now();
            getSocket().emit('Software.Install.done', aptGetInstall);
          },
          function(reason) {
            aptGetInstall.success = false;
            aptGetInstall.running = false;
            aptGetInstall.error.push(reason);
            aptGetInstall.lastUpdate = Date.now();
            getSocket().emit('Software.Install.done', aptGetInstall);
          },
        function(information) {
          if (information.data) {
            aptGetInstall.data.push(information.data.toString());
          }
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
      returnState(aptGetInstall, resp);
    }
  );

  app.get(
    '/plugin/software/bbserial',
    function (req, resp) {
      loadBoardSerial(showSerialScript)
        .then(function(result){
          resp.status(200);
          resp.send({bbSerial: result});
        },
        function(reason){
          resp.status(500);
          resp.end(reason);
        })
    }
  );

  app.get(
    '/plugin/software/branches',
    function (req, resp) {
      aptGet.getBranches()
        .then(
          function(result) {
            resp.statusCode = 200;
            resp.send(result);
            resp.end();
          },
          function(reason) {
            console.log("Error: " + reason)
          });
    }
  );

  /* Config */
  app.get(
    '/plugin/software/config',
    function(req, resp) {
      resp.send(preferences);
    });

  app.post(
    '/plugin/software/config/enableUpdates/:enabled',
    function (req, resp) {
      preferences.enableUpdates = req.params.enabled === "true";
      preferences.save();
      resp.status(200);
      resp.send(preferences);
    });

  app.post(
    '/plugin/software/config/selectedBranch/:branch',
    function (req, resp) {
      preferences.selectedBranch = req.params.branch;
      preferences.save();
      resp.status(200);
      resp.send(preferences);
    });

  function startAptGetUpdate() {
    aptGetUpdate.running = true;

    console.log("Starting apt-get update");
    aptGetUpdate = { promise: aptGet.update(), running: true, data: [], error: [], lastUpdate: aptGetUpdate.lastUpdate };
    return aptGetUpdate.promise.then(
     function() {
       console.log('apt-get update done');
       aptGetUpdate.running = false;
       aptGetUpdate.success = true;
       aptGetUpdate.lastUpdate = Date.now();
       aptCache.genCaches(function() {});
       getSocket().emit('Software.Update.done', aptGetUpdate);
     },
     function(reason) {
       console.log('apt-get update done with errors: ' + reason);
       aptGetUpdate.success = false;
       aptGetUpdate.running = false;
       aptGetUpdate.error.push(reason);
       aptGetUpdate.lastUpdate = Date.now();
       aptCache.genCaches(function() {});
       getSocket().emit('Software.Update.done', aptGetUpdate);
     },
     function(information) {
       console.log('apt-get update running');
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

  function returnState(process, resp) {
    process.currentTime = Date.now();
    resp.statusCode = process.running ? 206 : 200;
    resp.send(process);
    resp.end();
  }

  function loadBoardSerial(serialScript) {
    return Q.Promise(function (resolve, reject) {
      var status = cp.spawn('sh', [ serialScript ]);
      status.stdout.on('data', function (data) {
        var serial = data.toString();
        var parts = serial.split(':');
        if (parts.length > 0) {
          serial = parts[parts.length -1].trim();
        }
        resolve(serial);
      });
      status.on('close', function (code) {
        if (code !== 0) {
          reject("ERROR");
        }
      });
    });
  }

  var result = { ngModule: 'DashboardApp.Software' };
  console.log("Loaded software plugin");
  return result;
};
