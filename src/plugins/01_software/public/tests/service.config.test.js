
describe('service.config', function() {

  beforeEach(module('Software.services'));

  var configService;
  var $httpBackend;

  beforeEach(inject(function(_ConfigService_, _$httpBackend_) {
    configService = _ConfigService_;
    $httpBackend = _$httpBackend_;

    //sinon.stub($log, 'debug', function() {});
  }));

  describe('isUpdateEnabled get value from server', function () {
    describe('should get value from the configuration', function() {

      var testIsUpdateEnabled = function(value, done) {
        $httpBackend.expectGET('plugin/software/config')
          .respond(200, {enableUpdates: value});

        configService.isUpdateEnabled()
          .then(function (result) {
            result.should.equal(value);
            done();
          });

        $httpBackend.flush();
      };

      it('should be true', function (done) {
        testIsUpdateEnabled(true, done);
      });

      it('should be false', function (done) {
        testIsUpdateEnabled(false, done);
      });

      it('should return false on fault', function(done) {
        $httpBackend.expectGET('plugin/software/config')
          .respond(500);

        configService.isUpdateEnabled()
          .then(function (result) {
            result.should.be.false;
            done();
          });
        $httpBackend.flush();
      });
    });

    describe('enableUpdate should enable updates', function() {
      it('sends POST to the server', function() {
        $httpBackend.expectPOST('plugin/software/config/enableUpdates/true')
          .respond(200);
        configService.enableUpdate();
        $httpBackend.flush();
      });
    });

    describe('getSelectedBranch should retrieve branch from server', function() {

        it('retrieves the selected branch', function (done) {
          var BRANCH = 'some-branch';
          $httpBackend.expectGET('plugin/software/config')
            .respond(200, {selectedBranch: BRANCH});

          configService.getSelectedBranch()
            .then(function (result) {
              result.should.equal(BRANCH);
              done();
            });

          $httpBackend.flush();
        });

    });

    describe('setSelectedBranch should send the branch to the server', function() {

      it('sends a POST to the server', function() {
          var BRANCH = 'some-branch';
          $httpBackend.expectPOST('plugin/software/config/selectedBranch/' + BRANCH)
            .respond(200, {selectedBranch: BRANCH});

          configService.setSelectedBranch(BRANCH)

          $httpBackend.flush();
        });

    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    })
  });
});
