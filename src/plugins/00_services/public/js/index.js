(function (window, $, undefined) {
  'use strict';
  var Services;
  Services = function (dashboard) {

    var servicesViewModel = { visible: ko.observable(true) };
    // Add required UI elements
    $('#sidebar').append('<li id="services-sidebar" data-bind="template: { name: \'sidebarElementTemplate\' }"></li>');
    var sidebarVm = { description: 'Services', url: '/services' };
    ko.applyBindings(sidebarVm, $('#services-sidebar')[0]);

    $('#main-row').append('<div id="services" data-bind="visible: visible"></div>');
    ko.applyBindings(servicesViewModel, $('#services')[0]);
    console.log('Loaded Services plugin.');
  };
  window.Dashboard.plugins.push(Services);

}(window, jQuery));