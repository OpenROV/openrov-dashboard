var Q = require('q');

var PackageManager = function(dpkg, aptCache, aptGet) {
  'use strict';
  var pm = { };

  pm.getInstalledPackages = function(packageName) {
    var dpkgPackagesCall = Q.defer();
    dpkg.packagesAsync(packageName, function(result) {
      dpkgPackagesCall.resolve(result);
    });
    return dpkgPackagesCall.promise;
  };

  pm.getLatestVersions = function(packageName){
    var defered = Q.defer();
    aptCache.madison([packageName], function(items) {
      defered.resolve(items);
    });
    return defered.promise;
  };

  pm.getUpdates = function(packageName, branch){
    return aptCache.policy(packageName).then(
      function(result) {
        var candidates = result.result;
        var newVersions = [];

        candidates.forEach(function(candidate){
          candidate.versions.forEach(function(version) {
            if (candidate.installed !== '' &&
              candidate.installed !== candidate.candidate) {
              if (version.version === candidate.candidate &&
                  version.branch == branch) {
                newVersions.push({package: candidate.package, version: version.version})
              }
            }
          });
        });
        return newVersions;
      });
  };

  pm.getPreviousVersions = function(packageName, branch){
    return aptCache.policy(packageName)
      .then(
      function(result) {
        var candidates = result.result;
        var previousVersions = [];

        candidates.forEach(function(candidate){
          candidate.versions.forEach(function(version) {
            if (version.version !== candidate.installed ||
                version.version !== candidate.candidate) {
              if (version.branch == branch) {
                previousVersions.push({package: candidate.package, version: version.version})
              }
            }
          });
        });

        return previousVersions;
      });
  };

  pm.loadVersions = function(packageName, branch, showUpdatesOnly, showAllVersions) {
    var loadVersionsPromise = Q.defer();
    if (branch !== undefined && branch.trim().length > 0) {

      var getLatestSoftware = Q.defer();
      aptCache.madison([packageName], function(items) {
        getLatestSoftware.resolve(items);
      });

      var getCandidates = Q.defer();
      aptCache.getCandidates(packageName,   function(result) {
        if (result.exitCode === 0) {
          getCandidates.resolve(result.result);
        }
        else { getCandidates.reject(result.error); }
      });

      var getInstalled = pm.getInstalledPackages(packageName);

      Q.allSettled([getLatestSoftware.promise, getCandidates.promise, getInstalled.promise])
        .then(
        function(results) {
          results.forEach(function(result) {
            if (result.state !== "fulfilled") {
              loadVersionsPromise.reject(result.reason);
            }
          });
          var versions = results[0].value;
          var candidates = results[1].value;
          var installedSoftware = results[2].value;

          var newVersions = [];
          if (showUpdatesOnly) {
             newVersions = loadUpdatesOnlyPackages(installedSoftware, candidates, versions);
          }
          else {
            newVersions = loadAllPackages(versions, branch, showAllVersions, branch);
          }
          loadVersionsPromise.resolve(newVersions);
        },
        function(reason) {
          loadVersionsPromise.reject(reason);
        })
    }
    else {
      loadVersionsPromise.reject("No branch specified!");
    }
    return loadVersionsPromise.promise;
  };

  function loadUpdatesOnlyPackages(installedSoftware, candidates, versions, branch) {
    var result = [];
    candidates.forEach(function (candidate) {
      if (isPackageInstalled(installedSoftware, candidate)
        && !isPackageVersionInstalled(installedSoftware, candidate)) {
        var packagesToInstall =
          versions.filter(function (version) {
            return (version.branch === selectedBranch) && isSamePackage(candidate, version) && isSameVersion(candidate, version);
          });
        if (packagesToInstall && packagesToInstall.length == 1) {
          if(!newVersionsContainsPackage(result, packagesToInstall[0])) {
            result.push(packagesToInstall[0]);
          }
        }
      }
    });
    return result;
  }

  function loadAllPackages(versions, selectedBranch, onlyLatest) {
    var result = [];
    versions.forEach(function (version) {
      if (version.branch === selectedBranch) {
        if (! (onlyLatest && newVersionsContainsPackage(result, version) )) {
          result.push(version);
        }
      }
    });
    return result;
  }

  function isSamePackage(installed, item) {
    return installed.package === item.package;
  }

  function isSameVersion(installed, item) {
    return installed.version === item.version;
  }

  function newVersionsContainsPackage(latestVersions, version) {
    return latestVersions.filter(
      function(latest) { return isSamePackage(latest, version)  }
    ).length !== 0
  }

  function isPackageVersionInstalled(installedSoftware, version) {
    return installedSoftware.filter(
      function(installed) {
        if (isSamePackage(installed, version)) {
          return isSameVersion(installed, version);
        }
        return false;
      }).length > 0
  }

  function isPackageInstalled(installedSoftware, aPackage) {
    var result = installedSoftware.filter(
      function(installed) {
        return isSamePackage(installed, aPackage)
      });
    return result.length > 0
  }


  return pm;
};
module.exports = PackageManager;
