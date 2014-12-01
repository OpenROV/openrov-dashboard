const PREFERENCES = 'plugins:software';

function preferences(configuration) {
  var pluginPreferences = getPreferences(configuration);

  function savePreferences(config) {
    config.preferences.set(PREFERENCES, pluginPreferences);
    config.savePreferences();
  }

  function getPreferences(config) {
    var preferences = config.preferences.get(PREFERENCES);
    if (preferences === undefined) {
      preferences = {
        batteries: [
          new Battery('TrustFire', 8.0, 13.0)
        ],
        selectedBattery: 'TrustFire'
      };
      config.preferences.set(PREFERENCES, preferences);
    }
    console.log('Capestatus loaded preferences: ' + JSON.stringify(preferences));
    return preferences;
  }


}

module.exports = preferences;