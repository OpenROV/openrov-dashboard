/*
 *
 * Description:
 * Configuration file for dashboard
 *
 */
var argv = require('optimist').argv;
module.exports = {
  port: process.env.PORT || argv.port || 80,
  proxy: process.env.HTTP_PROXY || process.env.http_proxy || argv.proxy || undefined,
  aws: { bucket: 'openrov-deb-repository', region: 'us-west-2'},
  aptGetSourcelists : argv['source-list-dir'] || '/etc/apt/sources.list.d',

  DashboardEnginePath : './lib/DashboardEngine' + (process.env.USE_MOCK === 'true' ? '-mock' : '')
};
