/**
 * Created by pascalbrewing on 30/10/14.
 */
'use strict';

var assert = require('assert');
var debug = require('debug')('mway:mct-core:deploy');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mcapDeploy = require('mcap-deploy');
var GulpUtil = require('../util/gulp.js');

var Deploy = function (config) {
  assert(config, 'A config parameter is required');
  this.config = config;

  var gulpUtil = new GulpUtil(process.cwd());

  gulpUtil.on('data', function(data) {
    this.emit('data', data);
  }.bind(this));

  gulpUtil.on('error', function(data) {
    this.emit('error', data);
  }.bind(this));

  gulpUtil.on('exit', function(code) {
    debug('Gulp exited with exit code: %s', code);

    if (code > 0) {
      return this.emit('error', new Error('Gulp error'));
    }
    this.deploy();
  }.bind(this));

  gulpUtil.run('client', 'build');
};

util.inherits(Deploy, EventEmitter);

Deploy.prototype.deploy = function() {
  mcapDeploy.deploy(this.config)
  .then(function (endpoint) {
      debug('Complete: %s', endpoint);
      this.emit('complete', {
        client: endpoint + 'index.html',
        server: endpoint + 'api/'
      });
    }.bind(this))
  .catch(function (err) {
      debug('Error: %o', err);
      this.emit('error', err);
    }.bind(this));
};

module.exports = function(config) {
  return new Deploy(config);
};
