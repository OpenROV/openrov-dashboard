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
    dashboard.viewModel.samba = viewModel;
    dashboard.socket.on('status-samba', function (status) {
      viewModel.status(status);
    });
    // Add required UI elements
    $('#services').append('<div id="samba"></div>');
    $('#samba').load('plugin/03_samba/plugin.html', function () {
      ko.applyBindings({samba: viewModel}, $('#samba')[0]);
    });
    setInterval(viewModel.requestStatus, 3000);
    viewModel.requestStatus();
  };
  window.Dashboard.plugins.push(Samba);
}(window, jQuery));