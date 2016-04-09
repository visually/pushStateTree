const PushStateTree = require('../src/push-state-tree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';
const _ = require('underscore');

describe('PushStateTree beutifyLocation', function() {

  cleanHistoryAPI();

  let pstBeautify;
  let pst;

  beforeEach(() => {
    pst = new PushStateTree({
      basePath: _.uniqueId('/regular+path') + '/',
      beautifyLocation: false
    });
    pstBeautify = new PushStateTree({
      basePath: _.uniqueId('/beautify+path') + '/',
      beautifyLocation: true
    });
  });

  it('should be enabled by default', () => {
    let pst = new PushStateTree();
    expect(pst.beautifyLocation).to.be.true;
  });

  it('should allow disable beautifyLocation feature using constructor option', () => {
    expect(pst.beautifyLocation).to.be.false;
  });

  it('should allow to enable beautifyLocation feature using constructor option', () => {
    expect(pstBeautify.beautifyLocation).to.be.true;
  });

  it('should allow to change the beautifyLocation flag after start running', () => {
    pst.beautifyLocation = true;
    expect(pst.beautifyLocation).to.be.true;
  });

  describe('disabled', () => {

    beforeEach(() => {
      // Go to a path where the PST have beautify location disabled
      history.pushState(null, null, pst.basePath);
      pst.dispatch();
    });

    it('should prioritise the hash to provide the URI', () => {
      location.hash = '#test';
      expect(pst.uri).to.equal('test');
    });

    it('should remove the first slash from the URI in the regular URL', function(){
      let path = pst.basePath + 'test';

      history.pushState(null, null, path);
      //TODO: history pushState is not dispatching popstate
      pst.dispatch();

      expect(location.pathname).to.equal(path);
      expect(pst.uri).to.equal('test');
    });

    it('should remove the first slash from the URI in the location.hash', function(){
      location.hash = '/test';

      expect(location.hash).to.equal('#/test');
      expect(pst.uri).to.equal('test');
    });
  });

  describe('enabled', () => {
    beforeEach(() => {
      // Go to a path where the PST have beautify location disabled
      history.pushState(null, null, pstBeautify.basePath);
    });

    it('should get the uri removing the basePath', () => {
      // Reset URL
      let url = _.uniqueId('unique_url_');
      history.pushState(null, null, pstBeautify.basePath + url);
      pstBeautify.dispatch();

      // Test without the /
      expect(pstBeautify.uri).to.equal(url);
    });

    it('should redirect from the location.hash', () => {
      // Reset URL
      history.pushState(null, null, pstBeautify.basePath);

      let url = _.uniqueId('unique_url_');

      location.hash = '/' + url;

      expect(pstBeautify.uri).to.equal(url);
      expect(location.hash).to.equal('');

      expect(location.pathname).to.equal(pstBeautify.basePath + url);
    });

    it('should not redirect if basePath is not fulfilled', function(){
      history.pushState(null, null, '/invalidBasePath/');

      let url = _.uniqueId('/unique_url_');
      location.hash = url;
      expect(pst.uri).to.equal('');
      expect(location.hash).to.equal('#' + url);
    });

    it('should redirect from hash to url when basePath is fulfilled', function(){
      history.pushState(null, null, pstBeautify.basePath);

      let url = _.uniqueId('/unique_url_');

      location.hash = url;
      // Test without the initial slash
      expect(pstBeautify.uri).to.equal(url.substr(1));

      expect(location.hash).to.equal('');
    });

  });

  it('should no change if usePushState is false', function(){
    let pst = new PushStateTree({
      beautifyLocation: true,
      usePushState: false
    });
    expect(pst.beautifyLocation).to.be.false;
  });

});
