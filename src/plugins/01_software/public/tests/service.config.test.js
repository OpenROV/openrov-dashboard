
describe('service.config', function() {

  beforeEach(module('Software.services'));

  var configService;
  var $log;

  beforeEach(inject(function(_ConfigService_, _$log_) {
    configService = _ConfigService_;
    $log = _$log_;
    sinon.stub($log, 'debug', function() {});
  }));

  it('foo', function() {
    configService.test();

    expect($log.debug.callCount).to.equal(1);
    expect($log.debug.args[0][0]).to.equal('foo');

  });

});
