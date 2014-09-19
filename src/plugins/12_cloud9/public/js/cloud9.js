(function (window, $, undefined) {
  'use strict';
  var Cloud9;
  Cloud9 = function Example(dashboard) {
    var viewModel = new ProcessModel();
    viewModel.requestStatus = function () {
      dashboard.socket.emit('status-cloud9');
    };
    viewModel.start = function () {
      dashboard.socket.emit('start-cloud9');
    };
    viewModel.stop = function () {
      dashboard.socket.emit('stop-cloud9');
    };
    viewModel.cloud9Url = ko.observable("http://"+window.location.hostname + ':3131');

    dashboard.socket.on('status-cloud9', function (status) {
      viewModel.status(status);
    });
    // Add required UI elements
    $('#services').append('<div id="cloud9"></div>');
    $('#cloud9').load('plugin/12_cloud9/plugin.html', function () {
      ko.applyBindings({cloud9: viewModel}, $('#cloud9')[0]);
    });
    viewModel.requestStatus();

    dashboard.socket.on('services.refresh', viewModel.requestStatus);
    dashboard.socket.emit('services.register', 'services.cloud9');

    console.log('Loaded Cloud9 plugin.');
  };
  window.Dashboard.plugins.push(Cloud9);
}(window, jQuery));