var Q = require('q');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');
var underTest = require('../../lib/software');

chai.should();
chai.use(require('chai-things'));
chai.use(chaiAsPromised);

describe('software module', function() {
  var packageManager = { loadVersions: function (packageName, branch, showUpdatesOnly, showAllVersions) {} };

  describe('getUpdates', function() {
    var openrovTest = { package: 'openrov-test', version: '0.1.1'};
    var openrovTest2 = { package: 'openrov-test2', version: '0.2.2'};

    var packageManagerMock = sinon.mock(packageManager);
    packageManagerMock.expects("loadVersions")
      .once()
      .returns(Q.fcall(function () { return [ openrovTest, openrovTest2]; }));

    describe('works with a single branch', function() {
      var promise = new underTest(packageManager)
        .getUpdates([ 'test' ]);

      it('should be an array', function() {
        return promise.should.eventually.be.an("array");
      });

      it('should contain the openrov-test package', function() {
        return promise.should.eventually.contain.something.that.deep.equals(openrovTest);
      });

      it('should contain the openrov-test2 package', function() {
        return promise.should.eventually.contain.something.that.deep.equals(openrovTest2);
      });
    });
  });
});
