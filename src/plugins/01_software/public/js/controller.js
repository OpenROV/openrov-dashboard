angular.module('Software.controllers', ['Software.services']).
  controller('softwareController', function($scope, $q, BranchesApiService, softwareApiService, SocketAccess) {
    var socket = SocketAccess();

    $scope.showUpdatesOnly = true;
    $scope.showOnlyLatest = true;
    $scope.selectedBranch = undefined;
    $scope.installResult = '';
    $scope.latestVersions = [];
    $scope.refreshingPackages = false;
    $scope.aptUpdateRefreshDate = 'unknown';
    $scope.aptUpdateStatus = undefined;

    $scope.loadBranchesError = undefined;
    $scope.loadPackagesError = undefined;
    $scope.loadNewpackagesError = undefined;

    socket.on('Software.Update.update', function(data) {
      $scope.$apply(function() {
        $scope.aptUpdateStatus = data;
      });
    });

    socket.on('Software.Update.done', function(data) {
      $scope.$apply(function() {
        $scope.refreshingPackages = data.running;
        $scope.aptUpdateStatus = data;
      });
    });

    $scope.$watch('aptUpdateStatus', function(newStatus) {
      if (newStatus) {
        $scope.aptUpdateRefreshDate = newStatus.lastUpdate ? moment(newStatus.lastUpdate).fromNow() : 'unknown';
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
      softwareApiService.startAptUpdate().then(
        function(result) {
          $scope.aptUpdateStatus = result.data;
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
      softwareApiService.install(item.package, item.version, item.branch)
        .then(function(result) {
          $scope.installResult = JSON.stringify(result);
          $scope.loadInstalledSoftware();
          $scope.loadVersions();
        })
    };
    $scope.loadInstalledSoftware();



  });
