(function (window, $, undefined) {
  'use strict';
  var Samba;
  Samba = function (dashboard) {
    var viewModel = new ProcessModel();
    viewModel.requestStatus = function () {
      dashboard.socket.emit('status-samba');
    };
    viewModel.start = function () {
      dashboard.socket.emit('start-samba');
    };
    viewModel.stop = function () {
      dashboard.socket.emit('stop-samba');
    };
    viewModel.hostName = ko.observable(window.location.hostname);

    dashboard.socket.on('status-samba', function (status) {
      viewModel.status(status);
    });
    // Add required UI elements
    $('#services').append('<div id="samba"></div>');
    $('#samba').load('plugin/13_samba/plugin.html', function () {
      ko.applyBindings({samba: viewModel}, $('#samba')[0]);
    });

    dashboard.socket.on('services.refresh', viewModel.requestStatus);
    dashboard.socket.emit('services.register', 'services.samba');

    viewModel.requestStatus();
  };
  window.Dashboard.plugins.push(Samba);
}(window, jQuery));