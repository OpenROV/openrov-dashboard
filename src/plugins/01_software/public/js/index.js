(function (window, $, undefined) {
  'use strict';
  var Software;
  Software = function (dashboard) {

    var vm = { visible: ko.observable(false) };
    // Add required UI elements
    $('#sidebar').append('<div id="software-sidebar" data-bind="template: { name: \'sidebarElementTemplate\' }"></div>');
    var viewModel = { description: 'Software', click: function(){
      vm.visible(!vm.visible());
    }};
    ko.applyBindings(viewModel, $('#software-sidebar')[0]);

    $('#main-row').append('<div id="software" data-bind="visible: visible"><div id="software-content"></div></div>');
    ko.applyBindings(vm, $('#software')[0]);

    $('#software-content').load('plugin/01_software/plugin.html', function () {
      ko.applyBindings(vm, $('#software-content')[0]);
    });

    console.log('Loaded Software plugin.');
  };
  window.Dashboard.plugins.push(Software);
}(window, jQuery));