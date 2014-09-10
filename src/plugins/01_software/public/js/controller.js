angular.module('Software.controllers', []).
  controller('softwareController', function($scope, BranchesApiService) {
    BranchesApiService.getBranches().then(function(branches) {
      $scope.branches = branches;
    });
    $scope.selectedBranch = undefined;
  });
