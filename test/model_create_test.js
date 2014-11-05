'use strict';

var mctCore = require('..');
var yo = require('../lib/util/yo.js');
var sinon = require('sinon');
var yeoman  = require('yeoman-generator');
var assert = yeoman.assert;

describe('.model.create()', function () {
  var stubExecuteYo;

  beforeEach(function() {
    stubExecuteYo = sinon.stub(yo.prototype, '_run', function(generator, opts, cb) {
      cb();
    });
  });

  afterEach(function() {
    stubExecuteYo.restore();
  });

  it('require a callback parameter', function () {
    assert.throws(mctCore.model.create.bind(null));
  });

  it.skip('take a callback', function () {
    mctCore.model.create(function() {});
  });

  it.skip('create with callback', function () {
    var callback = sinon.spy();
    mctCore.model.create(callback);
    assert(stubExecuteYo.calledWith('mcap:model'));
    assert.ok(callback.calledOnce);
  });

});
