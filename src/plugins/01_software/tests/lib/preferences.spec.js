var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var underTest = require('../../lib/preferences');

chai.should();
chai.use(require('chai-things'));
chai.use(chaiAsPromised);

describe('preferences ', function() {
  var config;
  var configAccessor = function() { return config; };

  var setup = function() {
    config = {
      preferences: { get: function(name) { return undefined;  }, set:  function(name, value) {} },
      savePreferences: function() {}
    };
  };

  describe('getPreferences should get defaults', function() {
    setup();

    var preferences = new underTest(configAccessor);

    it('enableUpdates should be false', function() {
      preferences.enableUpdates.should.be.false;
    });

    it('selectedBranch should be "stable"', function() {
      preferences.selectedBranch.should.be.equal('stable');
    });

  });

  describe('getPreferences should get values from config', function() {
    beforeEach(setup);

    describe('get values from config', function() {
      var savedPreferences = { enableUpdates: true, selectedBranch: 'dev' };
      config.preferences.get = function(name) { return savedPreferences; };
      var preferences = new underTest(configAccessor);

      it('values should equal saved preferences', function() {
        preferences.should.deep.equal(savedPreferences);
      });
    });
  });

  describe('"save" should save the preferences', function() {
    beforeEach(setup);
    var newPrefValue = undefined;
    var savePreferencesCalled = false;

    config.preferences.set = function(name, value) { newPrefValue = value; };
    config.savePreferences = function() { savePreferencesCalled = true; };

    describe('save enableUpdates', function() {

      var preferences = new underTest(configAccessor);
      preferences.eableUpdates = true;
      preferences.selectedBranch = 'dev';
      preferences.save();

      it('enableUpdates should be saved', function() {
        newPrefValue.enableUpdates.should.be.true;
      });

      it('selectedBranch should be dev', function() {
        newPrefValue.selectedBranch.should.be.equal('dev');
      });

      it('preferences should have been saved', function () {
        savePreferencesCalled.should.be.true;
      });

    });
  });
});
