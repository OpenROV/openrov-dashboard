const PREFERENCES = 'plugins:software';

function preferences(configAccessor) {

  var pluginPreferences = getPreferences(configAccessor());

  function getPreferences() {
    var pref = configAccessor().preferences.get(PREFERENCES);
    if (pref === undefined) {
      pref = {
        enableUpdates: false,
        selectedBranch: 'stable'
      };
      configAccessor().preferences.set(PREFERENCES, pref);
    }
    pluginPreferences = pref;
    pluginPreferences.save = savePreferences;

    savePreferences();

    console.log('Software plugin loaded preferences: ' + JSON.stringify(pluginPreferences));
    return pref;
  }

  function savePreferences() {
    configAccessor().preferences.set(PREFERENCES, pluginPreferences);
    configAccessor().savePreferences();
  }

  return pluginPreferences;
}

module.exports = preferences;