module.exports = function(name, deps) {
  console.log("Loaded Services plugin");
  this.ngModule = 'DashboardApp.Services';
  return this;
};
