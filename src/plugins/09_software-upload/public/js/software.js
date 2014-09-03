(function (window, $, undefined) {
  'use strict';
  var Software;
  return;
  Software = function (dashboard) {
    var viewModel = {
        packages: ko.observableArray(),
        loading: ko.observable(false),
        installOutput: ko.observable('')
      };
    viewModel.refresh = function () {
      viewModel.loading(true);
      $.getJSON('/software/packages', function (data) {
        viewModel.packages.removeAll();
        data.forEach(function (item) {
          viewModel.packages.push(item);
        });
        viewModel.loading(false);
      });
    };
    dashboard.socket.on('software-install-status', function (status) {
      viewModel.installOutput(viewModel.installOutput() + status);
    });
    viewModel.refresh();
    var vm =  { software: viewModel };
    // Add required UI elements

    var softwareViewModel = { visible: ko.observable(false) };
    // Add required UI elements
    $('#sidebar').append('<div id="softwareupdate-sidebar" data-bind="template: { name: \'sidebarElementTemplate\' }"></div>');

    var sideBarViewModel = { description: 'Software install', click: function(){
      softwareViewModel.visible(!softwareViewModel.visible());
    }};
    ko.applyBindings(sideBarViewModel , $('#softwareupdate-sidebar')[0]);

    $('#main-row').append('<div id="softwareupdate" data-bind="visible: visible"><div id="softwareupdate-content"></div></div>');

    ko.applyBindings(softwareViewModel, $('#softwareupdate')[0]);
    $('#softwareupdate-content').load('plugin/09_software-upload/plugin.html', function () {
      ko.applyBindings(vm, $('#softwareupdate')[0]);
    });
    console.log('Loaded Software install plugin.');
  };
  window.Dashboard.plugins.push(Software);
}(window, jQuery));