angular.module('Software.controllers', ['Software.services']).
  controller('softwareController', function($scope, BranchesApiService, softwareApiService) {

    BranchesApiService.getBranches().then(function(branches) {
      $scope.branches = branches;
    });

    $scope.showAllVersions = false;
    $scope.selectedBranch = undefined;
    $scope.installResult = '';
    $scope.latestVersions = [];

    $scope.loadInstalledSoftware = function() {
      softwareApiService.loadInstalledSoftware().then(function(items) {
        $scope.installedSoftware = items.data;
      });
    };

    function getNewVersionFilter(item) {
      return function (installed) {
        if (installed.package === item.package && installed.version !== item.version) {
          if (!$scope.showAllVersions) {
            var index = $scope.latestVersions
              .map(function(latest) {return latest.package})
              .indexOf(item.package);
            return index == -1;
          }
          return true;
        }
        return false
      }
    }

    $scope.loadVersions = function() {
      $scope.latestVersions = [];
      if ($scope.selectedBranch) {
        softwareApiService.getLatestVersion('openrov-*')
          .then(function (versions) {
            versions.data.forEach(function (version) {
              if (version.branch === $scope.selectedBranch) {
                if ($scope.installedSoftware.filter(getNewVersionFilter(version)).length > 0) {
                  $scope.latestVersions.push(version);
                }
              }
            });
          });
      }
    };


    $scope.install = function(item) {
      alert(item.package + ' - ' + item.version + ' - ' + item.branch);
      softwareApiService.install(item.package, item.version, item.branch)
        .then(function(result) {
          $scope.installResult = JSON.stringify(result);
          $scope.loadInstalledSoftware();
          $scope.loadVersions();
        })
    };
    $scope.loadInstalledSoftware();
  });
