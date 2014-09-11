(function (window, $, undefined) {
  'use strict';
  var Software;
  Software = function (dashboard) {

    var sidebarVm = { description: 'Software', url: '/software' };

    // Add required UI elements
    $('#sidebar').append('<li id="software-sidebar" data-bind="template: { name: \'sidebarElementTemplate\' }"></li>');
    ko.applyBindings(sidebarVm, $('#software-sidebar')[0]);

    console.log('Loaded Software plugin.');
  };
  window.Dashboard.plugins.push(Software);
}(window, jQuery));