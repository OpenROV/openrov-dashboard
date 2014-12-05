angular.module('Software.controllers', ['Software.services', 'ui.bootstrap']).
  controller('softwareController',
    ['$scope', '$q', '$sce', '$modal', 'BranchesApiService', 'SoftwareApiService', 'ReportingService', 'ConfigService', 'SocketAccess',
      function($scope, $q, $sce, $modal, branchesApiService, softwareApiService, reportingService, configService, SocketAccess) {
        var socket = SocketAccess();
        $scope.isAdvancedMode = false;
        $scope.installedSoftware = [];
        $scope.installedSoftwareLoaded = false;
        $scope.selectedBranch = undefined;
        $scope.updatesEnabled = false;
        $scope.showUpdates = true;

        $scope.previousVersions = [];

        $scope.enableAdvanced = function() {
          $scope.isAdvancedMode = true;
        };

        $scope.toggleShowUpdates = function() {
          $scope.showUpdates = ! $scope.showUpdates;
          $scope.loadVersions();
        };





        $scope.showUpdatesOnly = true;
    $scope.showOnlyLatest = true;
    $scope.showIndividualPackages = false;

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

    $scope.bbSerial = 'N/A';
    $scope.geolocation = undefined;

    $scope.enableUpdate = function () {

      var modalInstance = $modal.open({
        templateUrl: 'modalAgreement.html',
        controller: ModalInstanceCtrl,
        size: '',
        resolve: {
          config: function () {
            return { bbSerial: $scope.bbSerial };
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.updatesEnabled = true;

        configService.enableUpdate();

        var locationPromise = $q.defer();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(location){
            locationPromise.resolve(location);
          });
        } else { //geolocation is disabled
          locationPromise.resolve();
        }
        return locationPromise.promise;
      }, function () {
        //dismissed
      })
        .then(function(location) {
          $scope.geolocation = location;

          reportingService
            .report($scope.installedSoftware, { bbSerial: $scope.bbSerial }, location)
            .then(function() {
              console.log('Reporting of ROV information successfully');
            }, function(reason) {
              console.log('There was an issue with reporting ROV information: ' + JSON.stringify(reason));
            });
        });
    };

    softwareApiService.getBbSerial().then(function(result) {
      $scope.bbSerial = result.data.bbSerial;
    });

    configService.isUpdateEnabled().then(function(result) {
      $scope.updatesEnabled = result;
    });

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

    $scope.$watch('aptUpdateStatus', function(newStatus) {
      if (newStatus) {
        console.log('update ' + JSON.stringify(newStatus));
        $scope.refreshingPackages = newStatus.running? newStatus.running : false;
        var lastUpdateString = 'unknown';
        if (newStatus.lastUpdate) {
          // the date on the ROV is not necessarily correct, therefore we get the
          // currentTime and extrapolate from there.
          var lastUpdate = moment(newStatus.lastUpdate);
          var currentTimeROV = moment(newStatus.currentTime ? newStatus.currentTime : Date.now());
          var diff = lastUpdate.diff(currentTimeROV);

          if (diff < 0) {
            lastUpdateString = lastUpdate.from(currentTimeROV);
          }
          else {
            lastUpdateString = "just now";
          }
        }

        $scope.aptUpdateRefreshDate = lastUpdateString;
      }
    });

    $scope.$watch('installResult', function(newStatus) {
      if (newStatus) {
        console.log('update ' + JSON.stringify(newStatus));
        $scope.installingPackage = newStatus.running? newStatus.running : false;
      }
    });

    $scope.$watch('selectedBranch', function(newBranch) {
      if (newBranch) {
        configService.setSelectedBranch(newBranch);
        $scope.loadVersions();
      }
    });

    $scope.$watch('showIndividualPackages', function(show) {
      $scope.loadInstalledSoftware();
      $scope.loadVersions();
    });

    function getBranches() {
      branchesApiService.getBranches()
        .then(
        function(branches) {
          $scope.branches = branches.data;
          $scope.loadBranchesError = undefined;

          configService.getSelectedBranch().then(function(result) {
            $scope.selectedBranch = result;
          })

        },
        function(reason) {
          $scope.loadBranchesError = reason;

        })
    }

    getBranches();

    softwareApiService.aptUpdateStatus().
      then(function(result) {
        $scope.aptUpdateStatus = result.data;
      });

    $scope.refreshPackages = function() {
      $scope.refreshingPackages = true;
      $scope.aptUpdateError = false;
      if ($scope.selectedBranch) {
        softwareApiService.startAptUpdate($scope.selectedBranch).then(
          function (result) {
            $scope.aptUpdateStatus = result.data;
          },
          function (reason) {
            console.log(JSON.stringify(reason));
          }
        );
      }
    };

    $scope.loadInstalledSoftware = function() {
      $scope.installedSoftwareLoaded = false;
      $scope.loadingInstalled = softwareApiService.loadInstalledSoftware($scope.showIndividualPackages);
      $scope.loadingInstalled.then(
        function(items) {
          $scope.loadPackagesError = undefined;
          $scope.installedSoftware = items.data;
          $scope.installedSoftwareLoaded = true;
        },
        function(reason) {
          $scope.loadPackagesError = reason;
          $scope.installedSoftwareLoaded = true;
        });
    };

    $scope.loadVersions = function() {
      if ($scope.showUpdates) {
        loadUpdates();
      }
      else {
        loadPreviousVersions();
      }
    };

        function loadUpdates() {
          $scope.latestVersions = [];
          if ($scope.selectedBranch) {
            var packageName = "openrov-rov-suite*";
            if ($scope.showIndividualPackages) {
              packageName = "openrov-*";
            }

            $scope.loadingPackages = softwareApiService.getUpdates(packageName);
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
        }

        function loadPreviousVersions() {
          $scope.previousVersions = [];
          var packageName = "openrov-rov-suite*";
          if ($scope.showIndividualPackages) {
            packageName = "openrov-*";
          }

          $scope.loadingPackages = softwareApiService.getPrevious(packageName);
          $scope.loadingPackages
            .then(
            function(result) {
              $scope.loadNewpackagesError = '';
              $scope.previousVersions = result.data;
            },
            function(reason) {
              $scope.loadNewpackagesError = reason;
            })

        }

    $scope.install = function(item) {
      $scope.installingPackage = true;
      $scope.installError = false;
      $scope.showIinstallResult = true;

      softwareApiService.install(item.package, item.version, $scope.selectedBranch)
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
    var ModalInstanceCtrl = function ($scope, $modalInstance, config) {
      $scope.config = config;
      $scope.ok = function () {
        $modalInstance.close();
      };
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };
}]);
