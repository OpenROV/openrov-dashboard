var Q = require('q');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');
var sinonPromise = require('sinon-promise');

var PackageManager = require('../../lib/package-manager');

chai.should();
chai.use(require('chai-things'));
chai.use(chaiAsPromised);
sinonPromise(sinon);


describe('package-manager module', function() {
  var dpkg = { packagesAsync: function(packageName, callback) {} };
  var aptCache = { madison: function(packageNames, callback) {}, getCandidates: function(pn, cb) {}, policy: function(pn) {} };
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

    it('should get updates to newer versions', function(done) {
      var policyResult = {
        result: [
          { package: PACKAGE_NAME, installed: '0.1.0', candidate: '0.1.1', versions: [
            { version: '0.1.0', branch: 'stable' },
            { version: '0.1.1', branch: 'stable' }
          ]}
        ],
        error: '',
        exitCode: 0 };
      _sinon.stub(aptCache, 'policy', sinon.promise().resolves(policyResult));

      underTest.getUpdates(PACKAGE_NAME, 'stable')
        .then(function(result) {
          try {
            result.length.should.equal(1);
            result[0].should.deep.equals({ package: PACKAGE_NAME, version: '0.1.1' });
            done();
          }
          catch(e) {
            done(e);
          }
        })
    });

    it('should show no updates to already installed versions', function() {
      var policyResult = {
        result: [
          { package: PACKAGE_NAME, installed: '0.1.1', candidate: '0.1.1', versions: [
            { version: '0.1.0', branch: 'stable' },
            { version: '0.1.1', branch: 'stable' }
          ]} ],
        error: '',
        exitCode: 0 };
      _sinon.stub(aptCache, 'policy', sinon.promise().resolves(policyResult));

      return underTest.getUpdates(PACKAGE_NAME)
        .should.eventually.be.empty;
    });

    it('should get only updates from the current branch', function() {
      var result = { package: PACKAGE_NAME, version: '0.1.2' };
      var policyResult = {
        result: [
          { package: PACKAGE_NAME, installed: '0.1.0', candidate: '0.1.2', versions: [
            { version: '0.1.0', branch: 'stable' },
            { version: '0.1.1', branch: 'stable' },
            { version: '0.1.2', branch: 'pre-release' }
          ]}
        ],
        error: '',
        exitCode: 0 };
      _sinon.stub(aptCache, 'policy', sinon.promise().resolves(policyResult));

      return underTest.getUpdates(PACKAGE_NAME, 'pre-release')
        .should.eventually.contain.something.that.deep
        .equals(result);
    });

  });

  describe('getPreviousVersions', function(){
    var _sinon = sinon.sandbox.create();
    afterEach(function() {
      _sinon.restore();
    });

    it('should get previous versions of installed packages', function(done) {
      var policyResult = {
        result: [ {
          package: PACKAGE_NAME,
          installed: '0.1.1',
          candidate: '0.1.1',
          versions: [
            { version: '0.1.1', branch: 'stable' },
            { version: '0.1.0', branch: 'stable' },
            { version: '0.0.9', branch: 'stable' }
          ]
        }
        ], error: '', exitCode: 0 };
      _sinon.stub(aptCache, 'policy', sinon.promise().resolves(policyResult));

      underTest.getPreviousVersions(PACKAGE_NAME, 'stable')
        .then(function(result){
          try {
            result.should.have.property('length', 2);
            result[0].should.deep
              .equal({ package: PACKAGE_NAME, version: '0.1.0' });
            result[1].should.deep
              .equal({ package: PACKAGE_NAME, version: '0.0.9' });
            done();
          }
          catch (e) {
            done(e);
          }
        });
    });

    it('should show no packages for already installed versions', function() {
      var policyResult = {
        result: [ {
          package: PACKAGE_NAME,
          installed: '0.1.1',
          candidate: '0.1.1',
          versions: [
            { version: '0.1.1', branch: 'stable' }
          ]
        }
        ], error: '', exitCode: 0 };
      _sinon.stub(aptCache, 'policy', sinon.promise().resolves(policyResult));

      return underTest.getPreviousVersions(PACKAGE_NAME, 'stable')
        .should.eventually.be.empty;
    });

    it('should show new packages that are not installed', function() {
      var result = { package: PACKAGE_NAME, version: '0.1.1' };
      var policyResult = {
        result: [ {
          package: PACKAGE_NAME,
          installed: '0.1.0',
          candidate: '0.1.1',
          versions: [
            { version: '0.1.1', branch: 'stable' },
            { version: '0.1.0', branch: 'stable' },
          ]
        }
        ], error: '', exitCode: 0 };
      _sinon.stub(aptCache, 'policy', sinon.promise().resolves(policyResult));

      return underTest.getPreviousVersions(PACKAGE_NAME, 'stable')
        .should.eventually.contain.something.that.deep
        .equals(result);
    });

    it('should show only versions from the currently selected branch', function(done) {
      var policyResult = {
        result: [ {
          package: PACKAGE_NAME,
          installed: '0.1.1',
          candidate: '0.1.1',
          versions: [
            { version: '0.1.1', branch: 'stable' },
            { version: '0.1.0', branch: 'stable' },
            { version: '0.0.9', branch: 'pre-release' }
          ]
        }
        ], error: '', exitCode: 0 };
      _sinon.stub(aptCache, 'policy', sinon.promise().resolves(policyResult));

      underTest.getPreviousVersions(PACKAGE_NAME, 'stable')
        .then(function(result){
          try {
            result.should.have.property('length', 1);
            result[0].should.deep
              .equal({ package: PACKAGE_NAME, version: '0.1.0' });
            done();
          }
          catch (e) {
            done(e);
          }
        });
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
