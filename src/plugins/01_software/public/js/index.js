(function (window, $, undefined) {
  'use strict';
  var Software;
  Software = function (dashboard) {

    var vm = { visible: ko.observable(false) };
    var sidebarVm = { description: 'Software', click: function(){
      vm.visible(!vm.visible());
    }};

    // Add required UI elements
    $('#sidebar').append('<div id="software-sidebar" data-bind="template: { name: \'sidebarElementTemplate\' }"></div>');
    $('#main-row').append('<div id="software" data-bind="visible: visible"><div id="software-content"></div></div>');
    ko.applyBindings(sidebarVm, $('#software-sidebar')[0]);
    ko.applyBindings(vm, $('#software')[0]);

    var softwareViewModel = {
      branches: [ {name: "master"}, {name: "development"} ],
      selectedBranch: "development",
      installedSoftware: ko.observableArray(),
      availableSoftware: [
        { name: "openrov-software-2.0", install: install },
        { name: "openrov-software-dashboard-2.0", install: install },
      ],
      refreshInstalled: function() {
        loadInstalled();
      }
    };
    $('#software-content').load('plugin/01_software/plugin.html', function () {
      ko.applyBindings(softwareViewModel, $('#software-content')[0]);
    });

    loadInstalled();

    function loadInstalled() {
      $.get('plugin/software/installed/', function (data) {
        softwareViewModel.installedSoftware.removeAll();
        data.forEach(function (item) {
          softwareViewModel.installedSoftware.push(item);
        });
      });
    }

    function install(item) {
      alert(item.name);
    }

    console.log('Loaded Software plugin.');
  };
  window.Dashboard.plugins.push(Software);
}(window, jQuery));