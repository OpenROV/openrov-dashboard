var Stream = require('stream');
var Q = require('q');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');
var AptCache = require('../../lib/apt-cache');

chai.should();
chai.use(require('chai-things'));
chai.use(chaiAsPromised);

describe('apt-cache', function() {
  var spawn = { stdout: new Stream.Readable() , stderr: '' };
  spawn.on = function(name, cb) {  spawn.cb = cb };
  spawn.stdout._read = function noop() {}; // redundant? see update below
  var cp = { spawn: function() { return spawn; } };
  var preferences = { selectedBranch: 'stable' };
  var aptCache = new AptCache(cp, preferences);
  const PACKAGE_NAME = 'openrov-rov-suite';

  describe('policy', function(){

    describe('should parse the data', function() {
      var promise = aptCache.policy('openrov-');
      policyExample(spawn.stdout);
      spawn.cb(0);

      it('should put everything in a result', function (done) {

        promise.then(function (result) {
          result.should.have.property('result');
          done();
        });
      });

      it('should have an array of results', function(done){
        promise.then(function(result) {
        result.result.should.be.an.instanceOf(Array)})
        done();
      });

      it('should read the package name', function(done) {
        promise.then(function(result) {
          result.result[0].package.should.be.equal(PACKAGE_NAME);
          done();
        })
      });

      it('should read the installed version ', function(done) {
        promise.then(function(result) {
          result.result[0].installed.should.be.equal('2.5.1-pre-release.21.2f75718');
          done();
        })
      });

      it('should read the candidate version ', function(done) {
        promise.then(function(result) {
          result.result[0].candidate.should.be.equal('2.5.1-pre-release.26.448f366');
          done();
        })
      });

      it('should have the version table', function(done) {
        promise.then(function(result) {
          try {
            result.result[0].versions.should.be.deep
              .equals([
                {version: '2.5.1-pre-release.26.448f366', branch: 'pre-release'},
                {version: '2.5.1-pre-release.21.2f75718', branch: 'pre-release'}
              ]);
            done();
          }
          catch (e) {
            done(e);
          }
        })
      });

      it('should parse not installed packages correctly', function(done) {
        promise.then(function(result) {
          try {
            result.result[2].installed.should.be.equal('');
            done();
          }
          catch (e) { done(e);}
        });
      })
    })
  });

});

function policyExample(buffer) {
  var lines = [
    "openrov-rov-suite:",
    "Installed: 2.5.1-pre-release.21.2f75718",
    "Candidate: 2.5.1-pre-release.26.448f366",
    "Version table:",
    "  2.5.1-pre-release.26.448f366 0",
    "    500 http://deb-repo.openrov.com/ pre-release/debian armhf Packages",
    "  2.5.1-pre-release.21.2f75718 0",
    "    500 http://deb-repo.openrov.com/ pre-release/debian armhf Packages",
    "openrov-mjpeg-streamer:",
    "Installed: 2.0.1-7",
    "Candidate: 2.0.1-7",
    "Version table:",
    "  *** 2.0.1-7 0",
    "    500 http://deb-repo.openrov.com/ stable/debian armhf Packages",
    "    100 /var/lib/dpkg/status",
    "  2.0-6 0",
    "    500 http://deb-repo.openrov.com/ stable/debian armhf Packages",
    "openrov-test:",
    "Installed: (none)",
    "Candidate: 0.0.1-1",
    "Version table:",
    "  0.0.1-1 0",
    "    500 http://deb-repo.openrov.com/ pre-release/debian armhf Packages"
  ];
    lines.forEach(function(line){
      buffer.push(line + "\n");
    });
  return buffer;
}
