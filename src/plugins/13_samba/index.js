function samba(name, deps) {
  deps.io.sockets.on('connection', function (socket) {
    socket.on('services.refresh', refresh);

    socket.on('status-samba', refresh);
    socket.on('start-samba', function () {
      deps.dashboardEngine.emit('signal', { key: 'start-samba' });
    });
    socket.on('stop-samba', function () {
      deps.dashboardEngine.emit('signal', { key: 'stop-samba' });
    });

    function refresh () {
      deps.dashboardEngine.emit('signal', { key: 'status-samba' });
    }
  });
}
module.exports = samba;