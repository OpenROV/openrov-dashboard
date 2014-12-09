var ReportingService = ['$http', function($http) {
  var reporting = {};

  reporting.report = function (istalledPackages, rovInformation, location) {
    return $http({
      method: 'POST',
      url: 'http://build.openrov.com/reporting/reportRov',
      data: {installedPackages: istalledPackages, rovInformation: rovInformation, location: location}
    });
  };
  return reporting;
}];