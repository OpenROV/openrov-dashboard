function cloud9(name, deps) {
  deps.io.sockets.on('connection', function (socket) {
    socket.on('services.refresh', refresh);
    socket.on('status-cloud9', refresh);
    socket.on('start-cloud9', function () {
      deps.dashboardEngine.emit('signal', { key: 'start-cloud9' });
    });
    socket.on('stop-cloud9', function () {
      deps.dashboardEngine.emit('signal', { key: 'stop-cloud9' });
    });

    function refresh() {
      deps.dashboardEngine.emit('signal', { key: 'status-cloud9' });
    };

  });
}
module.exports = cloud9;