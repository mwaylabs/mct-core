/**
 * Created by pascalbrewing on 30/10/14.
 */
'use strict';

var assert = require('assert');
var log = require('mcap-log');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mcapDeploy = require('mcap-deploy');
var GulpUtil = require('../util/gulp.js');
var checker = require('../util/checker.js');

/**
 * Deploy the project to a mcap with the given options.
 *
 * @type {Object} config
 * {
 *  baseurl: 'http://mcap.mway.io',
 *  username: 'sbuck',
 *  password: 'sbuck',
 *  rootPath: '/Users/stefanbuck/Desktop/sb-1/server',
 *  progress: funciton() {}
 * }
 */
var Deploy = function (config) {
  assert(config, 'A config parameter is required');
  this.config = config;

  var projectRoot = checker.getProjectRoot(config.rootPath);
  var gulpUtil = new GulpUtil(projectRoot);

  gulpUtil.on('data', function(data) {
    this.emit('data', data);
  }.bind(this));

  gulpUtil.on('error', function(data) {
    this.emit('error', data);
  }.bind(this));

  gulpUtil.on('exit', function(code) {
    log.debug('Gulp exited with exit code: %s', code);

    if (code > 0) {
      return this.emit('error', new Error('Gulp error'));
    }
    this.deploy();
  }.bind(this));

  log.info('Build client...');
  gulpUtil.run('client', 'build');
};

util.inherits(Deploy, EventEmitter);

Deploy.prototype.deploy = function() {
  mcapDeploy.deploy(this.config)
  .then(function (endpoint) {
      log.debug('Complete: %s', endpoint);
      this.emit('complete', {
        client: endpoint + 'index.html',
        server: endpoint + 'api/'
      });
    }.bind(this))
  .catch(function (err) {
      log.debug(err);
      this.emit('error', err);
    }.bind(this));
};

module.exports = function(config) {
  return new Deploy(config);
};
