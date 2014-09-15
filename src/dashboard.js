var config = require('./lib/config');
var express = require('express');
var app = express();
var server = app.listen(config.port);
var io = require('socket.io').listen(server, {log:false, origins:'*:*'});
var path = require('path');
var DashboardEngine = require(config.DashboardEnginePath);
var PluginLoader = require('./lib/PluginLoader');
var expressConfig = require('./config/express');
var socketConfig = require('./config/socketio');
var routesConfig = require('./config/routes');

// Keep track of plugins js and css to load them in the view
var assets = {
  scripts: [],
  styles: [],
  plugins: [],
  ngModules: function() {
    var result = [];
    assets.plugins.forEach(function(plugin) {
      if (plugin && plugin.ngModule) { result.push("'" + plugin.ngModule + "'"); }
    });
    return result.join();
  }
};

var dashboardEngine = new DashboardEngine();
var deps = {
  server: server,
  app: app,
  config: config,
  io: io,
  dashboardEngine: dashboardEngine,
  socket: undefined
};

expressConfig.setup(express, app, config);
routesConfig.setup(app, assets);
socketConfig.setup(deps);

var loader = new PluginLoader();
loader.loadPlugins(path.join(__dirname, 'plugins'), '/plugin', deps, addPluginAssets);

console.log('Started listening on port: ' + config.port);

// Load the plugins
var util = require('util');
function addPluginAssets(result) {
  assets.scripts = assets.scripts.concat(result.scripts);
  assets.styles = assets.styles.concat(result.styles);
  assets.plugins = assets.plugins.concat(result.plugins);
  result.assets.forEach(
    function(asset) {
      app.use(asset.path, express.static(asset.assets));
    });
}
