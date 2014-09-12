angular.module('Software.controllers', ['Software.services']).
  controller('softwareController', function($scope, $q, BranchesApiService, softwareApiService) {

    BranchesApiService.getBranches().then(function(branches) {
      $scope.branches = branches;
    });

    $scope.showUpdatesOnly = true;
    $scope.showOnlyLatest = true;
    $scope.selectedBranch = undefined;
    $scope.installResult = '';
    $scope.latestVersions = [];

    $scope.loadInstalledSoftware = function() {
      $scope.loadingInstalled = softwareApiService.loadInstalledSoftware();
      $scope.loadingInstalled.then(function(items) {
        $scope.installedSoftware = items.data;
      });
    };

    $scope.loadVersions = function() {
      $scope.latestVersions = [];
      if ($scope.selectedBranch) {
        var getLatestSoftware = softwareApiService.getLatestVersion('openrov-*');
        var getCandidates = softwareApiService.getInstallCandidate('openrov-*');
        $scope.loadingPackages = $q.all([getLatestSoftware, getCandidates]);

        $scope.loadingPackages
          .then(
          function(results) {
            var versions = results[0].data;
            var candidates = results[1].data;

            if ($scope.showUpdatesOnly) {
              loadUpdatesOnlyPackages(candidates.result, versions);
            }
            else {
              loadAllPackages(versions);
            }
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

    function loadUpdatesOnlyPackages(candidates, versions) {
      candidates.forEach(function (candidate) {
        if (isPackageInstalled(candidate)
          && !isPackageVersionInstalled(candidate)) {
          var packagesToInstall =
            versions.filter(function (version) {
              return isSamePackage(candidate, version) && isSameVersion(candidate, version);
            });
          if (packagesToInstall && packagesToInstall.length == 1) {
            if(!newVersionsContainsPackage(packagesToInstall[0])) {
              $scope.latestVersions.push(packagesToInstall[0]);
            }
          }
        }
      });
    }

    function loadAllPackages(versions) {
      versions.forEach(function (version) {
        if (version.branch === $scope.selectedBranch) {
          if (!($scope.showOnlyLatest && newVersionsContainsPackage(version))) {
            if (!newVersionsContainsPackage(version) || !isPackageVersionInstalled(version)) {
              $scope.latestVersions.push(version);
            }
          }
        }
      })
    }

    function isSamePackage(installed, item) {
      return installed.package === item.package;
    }

    function isSameVersion(installed, item) {
      return installed.version === item.version;
    }

    function newVersionsContainsPackage(version) {
      return $scope.latestVersions.filter(
        function(latest) { return isSamePackage(latest, version)  }
      ).length !== 0
    }

    function isPackageVersionInstalled(version) {
      return $scope.installedSoftware.filter(
        function(installed) {
            if (isSamePackage(installed, version)) {
             return isSameVersion(installed, version);
            }
            return false;
          }).length > 0
    }

    function isPackageInstalled(aPackage) {
      var result = $scope.installedSoftware.filter(
        function(installed) {
          return isSamePackage(installed, aPackage)
        });
      return result.length > 0
    }

  });
