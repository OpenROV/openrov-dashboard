angular.module('Software.controllers', ['Software.services']).
  controller('softwareController', function($scope, BranchesApiService, softwareApiService) {

    BranchesApiService.getBranches().then(function(branches) {
      $scope.branches = branches;
    });

    $scope.showNewVersions = true;
    $scope.showOnlyLatest = true;
    $scope.selectedBranch = undefined;
    $scope.installResult = '';
    $scope.latestVersions = [];

    $scope.loadInstalledSoftware = function() {
      softwareApiService.loadInstalledSoftware().then(function(items) {
        $scope.installedSoftware = items.data;
      });
    };

    $scope.loadVersions = function() {
      $scope.latestVersions = [];
      if ($scope.selectedBranch) {
        softwareApiService.getLatestVersion('openrov-*')
          .then(function (versions) {
            versions.data.forEach(function (version) {
              if (version.branch === $scope.selectedBranch) {
                if ($scope.installedSoftware.filter(
                  function(installed) {
                    if ($scope.showNewVersions) {
                      return isSamePackage(installed, version) && isSameVersion(installed, version)
                    }
                  }).length === 0) {
                  if (!latestVersionContainsPackage(version) || !$scope.showOnlyLatest) {
                    $scope.latestVersions.push(version);
                  }
                }
              }
            });
          });
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



    function isSamePackage(installed, item) {
      return installed.package === item.package;
    }

    function isSameVersion(installed, item) {
      return installed.version === item.version;
    }

    function latestVersionContainsPackage(version) {
      return $scope.latestVersions.filter(
        function(latest) { return isSamePackage(latest, version)  }
      ).length !== 0
    }

  });
