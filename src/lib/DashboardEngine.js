var EventEmitter = require('events').EventEmitter, spawn = require('child_process').spawn;
var DashboardEngine = function () {
  var baseDir = __dirname + '/../../linux/service-scripts/';
  var engine = new EventEmitter();
  var plugins = [
      'cockpit',
      'cloud9',
      'samba'
    ];
  engine.on('signal', function (message) {
    plugins.forEach(function (plugin) {
      var statusKey = 'status-' + plugin;
      if (message.key == statusKey) {
        status = spawn('sudo', [baseDir + statusKey + '.sh']);
        status.stderr.on('data', function (data) {
          console.log('stderr: ' + data);
        });
        status.on('close', function (code) {
          if (code === 0) {
            engine.emit('message', {
              key: statusKey,
              value: 'Running'
            });
          } else if (code === 1) {
            engine.emit('message', {
              key: statusKey,
              value: 'Stopped'
            });
          } else {
            engine.emit('message', {
              key: statusKey,
              value: 'Unknow'
            });
          }
        });
      }
      var startKey = 'start-' + plugin;
      if (message.key == startKey) {
        start = spawn('sh', [baseDir + startKey + '.sh']);
      }
      var stopKey = 'stop-' + plugin;
      if (message.key == stopKey) {
        start = spawn('sh', [baseDir + stopKey + '.sh']);
      }
    });
  });
  return engine;
};
module.exports = DashboardEngine;
