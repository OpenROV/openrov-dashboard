var Q = require('q');
var dpkg = require('./dpkg')();
var aptCache = require('./apt-cache')();
var aptGet = require('./apt-get')();

var PackageManager = function() {
  'use strict'
  var self = this;
  var pm = {
  };

  pm.getInstalledPackages = function(packageName, callback) {
    dpkg.packagesAsync(packageName, callback);
  };

  pm.loadVersions = function(packageName, branch, showUpdatesOnly) {
    var loadVersionsPromise = Q.defer();
    if (branch !== undefined && branch.trim().length > 0) {
      console.log('########' + branch);

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

      var getInstalled = Q.defer();
      pm.getInstalledPackages(packageName, function(result) {
        getInstalled.resolve(result);
      });

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
            newVersions = loadAllPackages(installedSoftware, versions, branch, showUpdatesOnly);
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

  function loadUpdatesOnlyPackages(installedSoftware, candidates, versions) {
    var result = [];
    candidates.forEach(function (candidate) {
      if (isPackageInstalled(installedSoftware, candidate)
        && !isPackageVersionInstalled(installedSoftware, candidate)) {
        var packagesToInstall =
          versions.filter(function (version) {
            return isSamePackage(candidate, version) && isSameVersion(candidate, version);
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

  function loadAllPackages(installedSoftware, versions, selectedBranch) {
    var result = [];
    versions.forEach(function (version) {
      if (version.branch === selectedBranch) {
        if (!newVersionsContainsPackage(result, version) || !isPackageVersionInstalled(installedSoftware, version)) {
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
