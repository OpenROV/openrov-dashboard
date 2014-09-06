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
      branches: ko.observableArray(),
      selectedBranch: ko.observable(),
      installedSoftware: ko.observableArray(),
      availableSoftware: [
        { name: "openrov-software-2.0", install: install },
        { name: "openrov-software-dashboard-2.0", install: install },
      ],
      refreshInstalled: loadInstalled
    };
    $('#software-content').load('plugin/01_software/plugin.html', function () {
      ko.applyBindings(softwareViewModel, $('#software-content')[0]);
    });

    loadInstalled();
    loadBranches();

    function loadInstalled() {
      $.get('plugin/software/installed/', function (data) {
        softwareViewModel.installedSoftware.removeAll();
        data.forEach(function (item) {
          softwareViewModel.installedSoftware.push({item: item, uninstall: uninstall});
        });
      });
    }

    function install(item) {
      alert('Install ' + item.name);
    }

    function uninstall(item) {
      alert('Uninstall ' + item.item.package);
    }

    function loadBranches() {
      getBranchesFromS3(function(branches) {
        softwareViewModel.branches.removeAll();
        branches.forEach(function(branch) {
          softwareViewModel.branches.push( { name: branch }); });
      });
    }

    function getBranchesFromS3(callback) {
      var branches = [];
      var bucketName = { Bucket: 'openrov-deb-repository' };
      var s3 = new AWS.S3({ region: 'us-west-2', params: bucketName });
      s3.makeUnauthenticatedRequest('listObjects', {
        Prefix: 'dists/'
      }, function (err, data) {
        if (err) {
          alert(err); //TODO fix error handling
        }
        else {
          data.Contents.forEach(function(item) {
            var parts = item.Key.split("/");
            if (branches.indexOf(parts[1]) === -1) {
              branches.push(parts[1]);
            }
          });
        }
        callback(branches);
      });
    }

    console.log('Loaded Software plugin.');
  };
  window.Dashboard.plugins.push(Software);
}(window, jQuery));