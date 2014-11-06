/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var debug = require('debug')('mway:mct-core:util:generator-path');

var basePath = function(generatorName) {
  var lookup = {
    'mcap': './',
    'm': './client',
    'm-server': './server'
  };
  var result = lookup[generatorName];
  debug('%s base path is %s', generatorName, result);
  return result;
};

module.exports = {
  basePath: basePath
};
