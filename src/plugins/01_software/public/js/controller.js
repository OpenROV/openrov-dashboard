angular.module('Software.controllers', ['Software.services']).
  controller('softwareController', function($scope, BranchesApiService, softwareApiService) {

    BranchesApiService.getBranches().then(function(branches) {
      $scope.branches = branches;
    });

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
        softwareApiService.getLatestVersion('openrov-*')
          .then(function(versions) {
            $scope.latestVersions =
              $scope.latestVersions.concat(versions.data.filter(
                function(item) {
                  return item.branch === $scope.selectedBranch &&
                  ($scope.installedSoftware.filter(
                    function (installed) {
                      return installed.package === item.package &&
                        installed.version !== item.version
                    }).length > 0);
                }));
          });
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
