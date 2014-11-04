/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var debug = require('debug')('mct:util:yo');

var YoWrapper = function() {};

YoWrapper.prototype._run = function(generator, opts, cb) {
  return this._env.run(generator, opts, cb);
};

YoWrapper.prototype.run = function(generator, options, cb) {

  var previousWorkingDirectory;

  if (typeof options.opts === 'function') {
    options.opts = options.opts();
  }

  options.opts = options.opts || {};
  options.opts['skip-install'] = true;
  options.opts['skip-welcome-message'] = true;

  debug('Run generator %s', generator);
  if (options.cwd) {
    debug('Change directory to %s', options.cwd);
    previousWorkingDirectory = process.cwd();
    process.chdir(options.cwd);
  }

  var generatorInstance = this._run(generator, options.opts, function(err) {
    if (err) {
      return cb(err);
    }
    if (previousWorkingDirectory) {
      process.chdir(previousWorkingDirectory);
    }
    cb(null, generatorInstance);
  });
};

YoWrapper.prototype.lookup = function (cb) {

  this._env = require('yeoman-environment').createEnv();
  this._env.on('error', function (err) {
    debug('error %s', err.message);
    cb(err);
  });

  // Get only local installed generators
  this._env.getNpmPaths = function() {
    return [path.resolve(__dirname, '../../node_modules')];
  };

  // Search for local generators
  this._env.lookup(cb);
};

module.exports = YoWrapper;
