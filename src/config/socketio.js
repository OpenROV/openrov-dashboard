module.exports = {
  setup: function(deps) {

    deps.io.sockets.on('connection', function (socket) {
      // redirecting messages to socket-ios
      deps.dashboardEngine.on('message', function (message) {
        socket.emit(message.key, message.value);
      });
      deps.socket = socket;
    });
  }
};
