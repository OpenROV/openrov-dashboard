module.exports = function(name, deps) {
  var app = deps.app;

  var result = { ngModule: 'DashboardApp.Proxy' };
  console.log("Loaded proxy plugin");
  return result;
};