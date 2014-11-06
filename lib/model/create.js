/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var Yo = require('../util/yo.js');

module.exports = function (cb) {
  cb = _.isFunction(cb) ? cb : function () {};

  var yo = new Yo();

  // Search for local generators
  yo.lookup(function() {
    yo.run('mcap:model', {}, function(err, generator) {
      if (err) {
        return cb(err);
      }
      var parentValues = generator.prepareValues();
      yo.run(['m-server:bikini', parentValues.name], {}, cb);
    });
  });
};
