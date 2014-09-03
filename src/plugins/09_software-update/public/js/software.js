(function (window, $, undefined) {
  'use strict';
  var Software;
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
    $('#sidebar').append('<div id="software-sidebar" data-bind="template: { name: \'sidebarElementTemplate\' }"></div>');

    var sideBarViewModel = { description: 'Software', click: function(){
      softwareViewModel.visible(!softwareViewModel.visible());
    }};
    ko.applyBindings(sideBarViewModel , $('#software-sidebar')[0]);

    $('#main-row').append('<div id="software" data-bind="visible: visible"><div id="software-content"></div></div>');

    ko.applyBindings(softwareViewModel, $('#software')[0]);
    $('#software-content').load('plugin/09_software-update/plugin.html', function () {
      ko.applyBindings(vm, $('#software')[0]);
    });
    console.log('Loaded Software plugin.');
  };
  window.Dashboard.plugins.push(Software);
}(window, jQuery));