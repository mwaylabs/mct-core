/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var log = require('mcap-log');
var generatorPath = require('./generator-path.js');

/**
 * A wrapper around yo. Use it to access the generator.
 */
var Yo = function() {};

Yo.prototype._run = function(generator, opts, cb) {
  return this._env.run(generator, opts, cb);
};

Yo.prototype.run = function(args, options, cb) {

  var previousWorkingDirectory;

  if (typeof options.opts === 'function') {
    options.opts = options.opts();
  }

  options.opts = options.opts || {};
  options.opts['skip-install'] = true;
  options.opts['skip-welcome-message'] = true;

  var generatorName = args;
  if (Array.isArray(generatorName)) {
    generatorName = generatorName[0];
  }
  generatorName = generatorName.split(':')[0];

  log.debug('Run generator %s', generatorName);
  var cwd = generatorPath.basePath(generatorName);
  if (cwd) {
    log.debug('Change directory to %s', cwd);
    previousWorkingDirectory = process.cwd();
    process.chdir(cwd);
  }

  var generatorInstance = this._run(args, options.opts, function(err) {
    if (err) {
      return cb(err);
    }
    if (previousWorkingDirectory && options.restoreCwd !== false) {
      process.chdir(previousWorkingDirectory);
    }
    cb(null, generatorInstance);
  });
};

Yo.prototype.lookup = function (cb) {

  this._env = require('yeoman-environment').createEnv();
  this._env.on('error', function (err) {
    log.debug('error %s', err.message);
    cb(err);
  });

  // Get only local installed generators
  this._env.getNpmPaths = function() {
    return [path.resolve(__dirname, '../../node_modules')];
  };

  // Search for local generators
  this._env.lookup(cb);
};

module.exports = Yo;
