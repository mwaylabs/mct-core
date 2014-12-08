/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var log = require('mcap-log');

var basePath = function(generatorName) {
  var lookup = {
    'mcap': './',
    'm': './client',
    'm-server': './server'
  };
  var result = lookup[generatorName];
  log.debug('%s base path is %s', generatorName, result);
  return result;
};

module.exports = {
  basePath: basePath
};
