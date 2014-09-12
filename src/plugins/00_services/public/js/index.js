(function (window, $, undefined) {
  'use strict';
  var Services;
  Services = function (dashboard) {

    // Add required UI elements
    $('#sidebar').append('<li id="services-sidebar" data-bind="template: { name: \'sidebarElementTemplate\' }"></li>');
    var sidebarVm = { description: 'Services', url: '/services' };
    ko.applyBindings(sidebarVm, $('#services-sidebar')[0]);

    $('body').append('<div id="services" hidden></div>');
    console.log('Loaded Services plugin.');
  };
  window.Dashboard.plugins.push(Services);

}(window, jQuery));