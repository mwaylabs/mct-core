/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var log = require('mcap-log');
var findup = require('findup-sync');

var isValidProject = function() {
  var cwd = process.cwd();
  var result = findup('mcap.json');
  log.debug('Folder %s is%s a mcap project', cwd, result ? '' : ' NOT');
  if (result) {
    log.debug('Found mcap.json at location %s', result);
  }

  return result !== null;
};

module.exports = {
  isValidProject: isValidProject
};
