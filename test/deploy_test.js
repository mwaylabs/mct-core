'use strict';

var mctCore = require('..');
var sinon = require('sinon');
var yeoman  = require('yeoman-generator');
var mcapDeploy  = require('mcap-deploy');
var q = require('q');
var assert = yeoman.assert;

describe('.deploy()', function () {
  var stubDeploy;

  beforeEach(function() {
    stubDeploy = sinon.stub(mcapDeploy, 'deploy', function(options) {
      var deferred = q.defer();

      if (options.baseurl === 'error-case') {
        deferred.reject(new Error('some-error'));
      } else {
        deferred.resolve({
          endpoint: 'http://localhost/orga/',
          baseAlias: 'myapp'
        });
      }

      return deferred.promise;
    });
  });

  afterEach(function() {
    stubDeploy.restore();
  });

  it('require options', function () {
    assert.throws(mctCore.deploy.bind(null));
  });

  it('take options', function () {
    mctCore.deploy({});
  });

  it('take a callback', function () {
    mctCore.deploy(function() {});
  });

  it('deploy with callback', function (done) {
    var options = {
      baseurl: 'http://localhost/',
      username: 'admin',
      password: 'password',
      baseAlias: 'myapp',
      rootPath: './path/to/myapp/'
    };

    var callback = function(err, data) {
      assert.equal(err, null);
      assert.equal(data.client, 'http://localhost/orga/myapp/index.html');
      assert.equal(data.server, 'http://localhost/orga/myapp/api/');
      done();
    };

    mctCore.deploy(options, callback);
  });

  it('deploy with error callback', function (done) {
    var options = {
      baseurl: 'error-case'
    };

    var callback = function(err, data) {
      assert.ok(err);
      assert.ok(err.message, 'some-error');
      assert.equal(data, null);
      done();
    };

    mctCore.deploy(options, callback);
  });
});
