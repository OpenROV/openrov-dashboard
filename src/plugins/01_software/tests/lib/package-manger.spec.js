var Q = require('q');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');
var PackageManager = require('../../lib/package-manager');

chai.should();
chai.use(require('chai-things'));
chai.use(chaiAsPromised);

describe('package-manager module', function() {
  var dpkg = { packagesAsync: function(packageName, callback) {} };
  var aptCache = { madison: function(packageNames, callback) {}, getCandidates: function(pn, cb) {} };
  var underTest = new PackageManager(dpkg, aptCache, null);
  const PACKAGE_NAME = 'openrov-rov-suite';

  describe('getInstalledPackages', function() {
    var _sinon = sinon.sandbox.create();
    var openrovTest = { package: 'openrov-test', version: '0.1.1'};
    var openrovTest2 = { package: 'openrov-test2', version: '0.2.2'};
    var result = [ openrovTest, openrovTest2 ];
    _sinon.stub(dpkg, 'packagesAsync', function(packageName, callback) { callback(result); });

    afterEach(function() {
      _sinon.restore();
    });

    describe('should get packages promise', function() {
      var promise = underTest.getInstalledPackages('test');

      it('should contain openrov-test', function() {
        return promise.should.eventually.contain.something.that.deep.equals(openrovTest);
      });

      it('should contain openrov-test2', function() {
        return promise.should.eventually.contain.something.that.deep.equals(openrovTest2);
      });

    });
  });

  describe('getUpdates', function(){
    var _sinon = sinon.sandbox.create();
    afterEach(function() {
      _sinon.restore();
    });

    it('should get updates to newer versions', function() {
      var result = { package: PACKAGE_NAME, version: '0.1.1' };
      _sinon.stub(aptCache, 'getCandidates', function(pn, callback) {
        callback( { result: [result], error: '', exitCode: 0 });
      });
      _sinon.stub(dpkg, 'packagesAsync', function(packageName, callback) {
        callback([{package: PACKAGE_NAME, version: '0.1.0'}]);
      });

      return underTest.getUpdates(PACKAGE_NAME)
        .should.eventually.contain.something.that.deep
        .equals(result);
    });

    it('should show no updates to already installed versions', function() {
      var result = { package: PACKAGE_NAME, version: '0.1.1' };
      _sinon.stub(aptCache, 'getCandidates', function(pn, callback) {
        callback( { result: [result, { package: 'openrov-cockpit', version: '0.1.1'}], error: '', exitCode: 0 });
      });
      _sinon.stub(dpkg, 'packagesAsync', function(packageName, callback) {
        callback([result]);
      });

      return underTest.getUpdates(PACKAGE_NAME)
        .should.eventually.be.empty;
    });

  });

  describe('getPreviousVersions', function(){
    var _sinon = sinon.sandbox.create();
    afterEach(function() {
      _sinon.restore();
    });

    it('should get previous versions of installed packages', function() {
      var result = { package: PACKAGE_NAME, version: '0.1.0' };
      var result2 = { package: PACKAGE_NAME, version: '0.0.9' };
      _sinon.stub(aptCache, 'madison', function(pn, callback) {
        callback( [result, result2] );
      });
      _sinon.stub(dpkg, 'packagesAsync', function(packageName, callback) {
        callback([{package: PACKAGE_NAME, version: '0.1.1'}]);
      });

      return underTest.getPreviousVersions(PACKAGE_NAME)
        .should.eventually.contain.something.that.deep
        .equals(result)
        .and.should.eventually.contain.something.that.deep
        .equals(result2);
    });

    it('should show no packages for already installed versions', function() {
      var result = { package: PACKAGE_NAME, version: '0.1.1' };
      _sinon.stub(aptCache, 'madison', function(pn, callback) {
        callback( [result] );
      });
      _sinon.stub(dpkg, 'packagesAsync', function(packageName, callback) {
        callback([result]);
      });

      return underTest.getPreviousVersions(PACKAGE_NAME)
        .should.eventually.be.empty;
    });

  });


  describe('getLatestVersion', function(){

    it('should get latest version of packages', function(){
      var result = { package: PACKAGE_NAME, version: '0.1.1' };
      sinon.stub(aptCache, 'madison', function(packageNames, callback) { callback([result]); });

      return underTest.getLatestVersions(PACKAGE_NAME)
        .should.eventually.contain.something.that.deep
          .equals(result);
    });
  });
});
