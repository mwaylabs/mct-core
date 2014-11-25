/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var debug = require('debug')('mway:mct-core:util:gulp');
var assert = require('assert');
var path = require('path');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var spawn = require('cross-spawn');

var GulpUtil = function(dir) {
  this.spawnCommand = spawn;
  this.workingDir = dir;
};

util.inherits(GulpUtil, EventEmitter);

var removeLastLineBreak = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
};

GulpUtil.prototype._run = function(location) {
  var args = Array.prototype.slice.call(arguments, 1);
  args = args.concat(['--no-color']);

  var baseDir = path.join(this.workingDir, location);
  var gulpPath = path.join(baseDir, 'node_modules', 'gulp', 'bin', 'gulp.js');
  debug('Gulp bin path: %s', gulpPath);

  process.chdir(baseDir);
  var cp = this.spawnCommand(gulpPath, args);
  cp.stdout.setEncoding('utf8');
  cp.stderr.setEncoding('utf8');
  cp.stdout.on('data', function (data) {
    data = removeLastLineBreak(data);
    debug('stdout %s', data);
    this.emit('data', data);
  }.bind(this));

  cp.stderr.on('data', function (data) {
    data = removeLastLineBreak(data);
    debug('stderr %s', data);
    this.emit('error', data);
  }.bind(this));

  cp.on('exit', function (code) {
    // Restore last workin directory
    process.chdir(this.workingDir);
    debug('exitCode %s', code);
    this.emit('exit', code);
  }.bind(this));
};

GulpUtil.prototype.run = function(location, taskName) {
  assert.ok(location, 'A location is required');
  assert.ok(['server', 'client'].indexOf(location) > -1, 'Location must be \'server\' or \'client\'');

  taskName = taskName || 'default';
  this._run(location, taskName);
};

module.exports = GulpUtil;
