'use strict';

var mctCore = require('..');
var assert = require('assert');
var sinon = require('sinon');
var mcapLogger  = require('mcap-logger');
var q = require('q');

describe('.logger()', function () {
  var stubLogger;

  beforeEach(function() {
    stubLogger = sinon.stub(mcapLogger.prototype, 'watch', function() {
      var deferred = q.defer();
      deferred.resolve();
      return deferred.promise;
    });
  });

  afterEach(function() {
    stubLogger.restore();
  });

  it('require options', function () {
    assert.throws(mctCore.logger.bind(null));
  });

  it('take options', function () {
    mctCore.logger({
      baseurl: 'http://mcap.mway.io',
      username: 'mway',
      password: 'mway',
      appUUID: '3785733C-B873-4D43-AC88-8CB5C38407EA'
    });
  });
});
