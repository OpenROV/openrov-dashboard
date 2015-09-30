/*
 *
 * Description:
 * Configuration file for dashboard
 *
 */

var nconf = require('nconf');
var argv = require('optimist').argv;
var fs = require('fs');

var configDir = '/etc/';

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir)
}

nconf.argv().env('__'); //Also look for overrides in environment settings

// Will essentially rewrite the file when a change to the defaults are made if there is a parsing error.
try {
  nconf.use('file', { file: configDir + 'dashboardconfig.json' });
} catch (err) {
  console.log('Unable to load the configuration file, resetting to defaults');
  console.log(err);
}


// Do not change these values in this file for an individual ROV, use the ./etc/rovconfig.json instead
nconf.defaults({
  port: 80,
  proxy: undefined,
  aws: { bucket: 'openrov-deb-repository', region: 'us-west-2'},
  aptGetSourcelists : '/etc/apt/sources.list.d'
});

function savePreferences() {
  nconf.save(function (err) {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('Configuration saved successfully.');
  });
}


module.exports = {
  port: process.env.PORT || argv.port || nconf.get('port'),
  proxy: argv.proxy || nconf.get('proxy'),
  aws: nconf.get('aws'),
  aptGetSourcelists : argv['source-list-dir'] || nconf.get('aptGetSourcelists'),
  DashboardEnginePath : './lib/DashboardEngine' + (process.env.USE_MOCK === 'true' ? '-mock' : ''),

  preferences: nconf,
  savePreferences: savePreferences
};
