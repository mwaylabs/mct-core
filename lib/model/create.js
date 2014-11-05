/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var _ = require('lodash');
var Yo = require('../util/yo.js');

module.exports = function (cb) {
  assert(cb, 'A cb parameter is required');
  assert.ok(_.isFunction(cb), 'Callback must be a function');

  var yo = new Yo();

  // Search for local generators
  yo.lookup(function() {
    yo.run('mcap:model', {}, cb);
  });
};
