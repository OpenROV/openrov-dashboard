(function (window, $, undefined) {
  'use strict';
  var Services;
  Services = function (dashboard) {

    // Add required UI elements
    $('#sidebar').append(
      '<div id="services-sidebar" data-bind="template: { name: \'sidebarElementTemplate\' }"></div>');
    var viewModel = { description: 'Service', click: function(){ alert('foo'); }};
    ko.applyBindings(viewModel, document.getElementById('services-sidebar'));

    $('#main-row').append('<div id="services" class=""></div>');
    console.log('Loaded Services plugin.');
  };
  window.Dashboard.plugins.push(Services);
}(window, jQuery));