'use strict';

var mctCore = require('..');
var sinon = require('sinon');
var yeoman  = require('yeoman-generator');
var mcapDeploy  = require('mcap-deploy');
var q = require('q');
var assert = yeoman.assert;
var GulpUtil = require('../lib/util/gulp.js');

describe('.deploy()', function () {
  var stubDeploy;
  var stubExecuteGulp;

  beforeEach(function() {
    stubDeploy = sinon.stub(mcapDeploy, 'deploy', function(options) {
      var deferred = q.defer();

      if (options.baseurl === 'error-case') {
        deferred.reject(new Error('some-error'));
      } else {
        deferred.resolve('http://localhost/orga/myapp/');
      }

      return deferred.promise;
    });

    stubExecuteGulp = sinon.stub(GulpUtil.prototype, '_run', function() {
      this.emit('exit', 0);
    });
  });

  afterEach(function() {
    stubDeploy.restore();
    stubExecuteGulp.restore();
  });

  it('require options', function () {
    assert.throws(mctCore.deploy.bind(null));
  });

  it('take options', function () {
    mctCore.deploy({});
  });

  it('deploy with callback', function (done) {
    var options = {
      baseurl: 'http://localhost/',
      username: 'admin',
      password: 'password',
      baseAlias: 'myapp',
      rootPath: './path/to/myapp/'
    };

    var handler = function(data) {
      assert.equal(data.client, 'http://localhost/orga/myapp/index.html');
      assert.equal(data.server, 'http://localhost/orga/myapp/api/');
      done();
    };

    mctCore.deploy(options).on('complete', handler);
  });

  it('deploy with error callback', function (done) {
    var options = {
      baseurl: 'error-case'
    };

    var handler = function(err, data) {
      assert.ok(err);
      assert.ok(err.message, 'some-error');
      assert.equal(data, null);
      done();
    };

    mctCore.deploy(options).on('error', handler);
  });
});
