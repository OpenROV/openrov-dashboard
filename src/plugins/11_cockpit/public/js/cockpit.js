(function (window, $, undefined) {
  'use strict';
  var Cockpit;
  Cockpit = function (dashboard) {
    var viewModel = new ProcessModel();
    viewModel.requestStatus = function () {
      dashboard.socket.emit('status-cockpit');
    };
    viewModel.start = function () {
      dashboard.socket.emit('start-cockpit');
    };
    viewModel.stop = function () {
      dashboard.socket.emit('stop-cockpit');
    };
    viewModel.cockpitUrl = ko.observable("http://"+window.location.hostname + ':8080');

    dashboard.socket.on('status-cockpit', function (status) {
      viewModel.status(status);
    });
    // Add required UI elements
    $('#services').append('<div id="cockpit"></div>');
    $('#cockpit').load('plugin/11_cockpit/plugin.html', function () {
      ko.applyBindings({cockpit: viewModel}, $('#cockpit')[0]);
    });
    viewModel.requestStatus();

    dashboard.socket.on('services.refresh', viewModel.requestStatus);
    dashboard.socket.emit('services.register', 'services.cockpit');

    console.log('Loaded Cockpit plugin.');
  };
  window.Dashboard.plugins.push(Cockpit);
}(window, jQuery));
