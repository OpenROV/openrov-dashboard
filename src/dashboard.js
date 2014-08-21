var config = require('./lib/config');
var express = require('express'), app = express(), server = app.listen(config.port), io = require('socket.io').listen(server), path = require('path'), DashboardEngine = require(config.DashboardEnginePath);
var PluginLoader = require('./lib/PluginLoader');

// Keep track of plugins js and css to load them in the view
var scripts = [], styles = [];
app.configure(function () {
  app.use(express.static(__dirname + '/static/'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(app.router);
  app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs', { pretty: true });
});
app.get('/', function (req, res) {
  res.render('index', {
    title: 'Express',
    scripts: scripts,
    styles: styles
  });
});
var cockpit = { status: 'Unknown' };
// no debug messages
io.configure(function () {
  io.set('log level', 1);
});
var dashboardEngine = new DashboardEngine();
var deps = {
    server: server,
    app: app,
    io: io,
    dashboardEngine: dashboardEngine,
    socket: undefined
  };
// Load the plugins
function addPluginAssets(result) {
  scripts = scripts.concat(result.scripts);
  styles = styles.concat(result.styles);
  result.assets.forEach(
    function(asset) {
      app.use(asset.path, express.static(asset.assets));
    });
}

var loader = new PluginLoader();
loader.loadPlugins(path.join(__dirname, 'plugins'), '/plugin', deps, addPluginAssets);

io.sockets.on('connection', function (socket) {
  // redirecting messages to socket-ios
  dashboardEngine.on('message', function (message) {
    socket.emit(message.key, message.value);
  });
  deps.socket = socket;
});
console.log('Started listening on port: ' + config.port);