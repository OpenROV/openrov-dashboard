module.exports = {
  setup: function(deps) {

    // no debug messages
    deps.io.configure(function () {
      deps.io.set('log level', 1);
    });

    deps.io.sockets.on('connection', function (socket) {
      // redirecting messages to socket-ios
      deps.dashboardEngine.on('message', function (message) {
        socket.emit(message.key, message.value);
      });
      deps.socket = socket;
    });
  }
};
