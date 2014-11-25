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
  var underTest = new PackageManager(dpkg, null, null);

  describe('getInstalledPackages', function() {
    var openrovTest = { package: 'openrov-test', version: '0.1.1'};
    var openrovTest2 = { package: 'openrov-test2', version: '0.2.2'};
    var result = [ openrovTest, openrovTest2 ];
    var stub = sinon.stub(dpkg, 'packagesAsync', function(packageName, callback) { callback(result); });

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
});
