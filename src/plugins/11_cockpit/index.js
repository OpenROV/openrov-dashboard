function cockpit(name, deps) {
  deps.io.sockets.on('connection', function (socket) {
    socket.on('services.refresh', refresh);
    socket.on('status-cockpit', refresh);
    socket.on('start-cockpit', function () {
      deps.dashboardEngine.emit('signal', { key: 'start-cockpit' });
    });
    socket.on('stop-cockpit', function () {
      deps.dashboardEngine.emit('signal', { key: 'stop-cockpit' });
    });

    function refresh() {
      deps.dashboardEngine.emit('signal', { key: 'status-cockpit' });
    }
  });
}
module.exports = cockpit;