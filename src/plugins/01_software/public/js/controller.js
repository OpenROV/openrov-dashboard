angular.module('Software.controllers', ['Software.services']).
  controller('softwareController', function($scope, BranchesApiService, softwareApiService) {
    BranchesApiService.getBranches().then(function(branches) {
      $scope.branches = branches;
    });
    softwareApiService.loadInstalledSoftware().then(function(items) {
      $scope.installedSoftware =  items.data;
    });
    $scope.selectedBranch = undefined;
  });
