/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var Logger = require('mcap-logger');
var log = require('mcap-log');
var _ = require('lodash');

/**
 * Bind a remote logger the the given application
 *
 * @type {Object} config
 * {
 *  baseurl: 'http://mcap.mway.io',
 *  username: 'mway',
 *  password: 'mway',
 *  appUUID: '3785733C-B873-4D43-AC88-8CB5C38407EA',
 *  loglevel: 'info'
 * }
 * @type {Function} cb
 */
module.exports = function(config, cb) {
  assert(config, 'A config parameter is required');
  assert(config.baseurl, 'A config.baseurl parameter is required');
  assert(config.username, 'A config.username parameter is required');
  assert(config.password, 'A config.password parameter is required');
  assert(config.appUUID, 'A config.appUUID parameter is required');

  var logger = new Logger({
    auth: {
      user: config.username,
      pass: config.password
    },
    baseUrl: config.baseurl
  });

  logger.watch({
    name: 'javascript.applications.' + config.appUUID,
    level: config.loglevel
  }).then(function(){
    cb(null);
  }, cb);

  logger.output = function(msg){
    if (!msg) {
      return;
    }
    _.each(msg, function (item) {
      if (item.message && item.level) {
        var levelName = Logger.getNameFromLevel(item.level);
        log[levelName](item.message);
      }
    });
  };

  // Keep the process running.
  process.stdin.resume();
};
