angular.module('Software.controllers', ['Software.services']).
  controller('softwareController', function($scope, $q, $sce, BranchesApiService, softwareApiService, SocketAccess) {
    var socket = SocketAccess();

    $scope.showUpdatesOnly = true;
    $scope.showOnlyLatest = true;
    $scope.selectedBranch = undefined;

    $scope.latestVersions = [];
    $scope.refreshingPackages = false;
    $scope.aptUpdateRefreshDate = 'unknown';
    $scope.aptUpdateStatus = undefined;

    $scope.loadBranchesError = undefined;
    $scope.loadPackagesError = undefined;
    $scope.loadNewpackagesError = undefined;
    $scope.aptUpdateError = false;
    $scope.aptUpdateErrorData = undefined;

    $scope.installResult = { running: false, data: [] };
    $scope.installingPackage = false;
    $scope.installError = false;
    $scope.installErrorData = undefined;
    $scope.showIinstallResult = false;

    socket.on('Software.Update.update', function(data) {
      $scope.$apply(function() {
        $scope.aptUpdateStatus = data;
      });
    });

    socket.on('Software.Update.done', function(data) {
      $scope.$apply(function() {
        $scope.refreshingPackages = data.running;
        $scope.aptUpdateStatus = data;
        if (!data.success) {
          $scope.aptUpdateError = true;
          var error = "<hr><strong>Output:</strong> <br>" + data.data.join('<br>')
            + '<br><hr><br><strong>Error: </strong>' + data.error.join('<br>');
          $scope.aptUpdateErrorData = $sce.trustAsHtml(error);
        }
      });
    });

    socket.on('Software.Install.update', function(data) {
      $scope.$apply(function() {
        $scope.installResult = data;
      });
    });

    socket.on('Software.Install.done', function(data) {
      $scope.$apply(function() {
        console.log('update ' + JSON.stringify(data));
        $scope.installingPackage = data.running;
        $scope.installResult = data;
        if (!data.success) {
          $scope.installError = true;
          var error = "<hr><strong>Output:</strong> <br>" + data.data.join('<br>')
            + '<br><hr><br><strong>Error: </strong>' + data.error.join('<br>');
          $scope.installErrorData = $sce.trustAsHtml(error);
        }
        else {

          $scope.loadInstalledSoftware();
          $scope.loadVersions();
        }

      });
    });

    socket.on('connect', function() { console.log('CONNECTED!'); })
    socket.on('Software.Cockpit.message', function(message){
      alert(message);
      socket.emit('Software.Cockpit.answer', 'Thanks for ' + message);
    });

    $scope.$watch('aptUpdateStatus', function(newStatus) {
      if (newStatus) {
        console.log('update ' + JSON.stringify(newStatus));
        $scope.refreshingPackages = newStatus.running? newStatus.running : false;
        $scope.aptUpdateRefreshDate = newStatus.lastUpdate ? moment(newStatus.lastUpdate).fromNow() : 'unknown';
      }
    });

    $scope.$watch('installResult', function(newStatus) {
      if (newStatus) {
        console.log('update ' + JSON.stringify(newStatus));
        $scope.installingPackage = newStatus.running? newStatus.running : false;
      }
    });

    BranchesApiService.getBranches().then(
      function(branches) {
        $scope.branches = branches;
        $scope.loadBranchesError = undefined;
      },
      function(reason) {
        $scope.loadBranchesError = reason;

      });

    softwareApiService.aptUpdateStatus().
      then(function(result) {
        $scope.aptUpdateStatus = result.data;
      });

    $scope.refreshPackages = function() {
      $scope.refreshingPackages = true;
      $scope.aptUpdateError = false;
      softwareApiService.startAptUpdate().then(
        function(result) {
          $scope.aptUpdateStatus = result.data;
        },
        function(reason) {
          console.log(JSON.stringify(reason));
        }
      );
    };

    $scope.loadInstalledSoftware = function() {
      $scope.loadingInstalled = softwareApiService.loadInstalledSoftware();
      $scope.loadingInstalled.then(
        function(items) {
          $scope.loadPackagesError = undefined;
          $scope.installedSoftware = items.data;
        },
        function(reason) {
          $scope.loadPackagesError = reason;
        });
    };

    $scope.loadVersions = function() {
      $scope.latestVersions = [];
      if ($scope.selectedBranch) {
        var packageName = 'openrov-*';

        if ($scope.showUpdatesOnly) {
          $scope.loadingPackages = softwareApiService.getUpdates(packageName, $scope.selectedBranch);
        }
        else {
          $scope.loadingPackages = softwareApiService.getAll(packageName, $scope.selectedBranch, $scope.showOnlyLatest);
        }

        $scope.loadingPackages
          .then(
          function(result) {
            $scope.loadNewpackagesError = '';
            $scope.latestVersions = result.data;
          },
          function(reason) {
            $scope.loadNewpackagesError = reason;
          })
      }
    };

    $scope.install = function(item) {
      $scope.installingPackage = true;
      $scope.installError = false;
      $scope.showIinstallResult = true;

      softwareApiService.install(item.package, item.version, item.branch)
        .then(
        function (result) {
          $scope.installResult = result.data;
        },
        function (reason) {
          console.log(JSON.stringify(reason));
        }
      );
    };

    $scope.loadInstalledSoftware();

  });
