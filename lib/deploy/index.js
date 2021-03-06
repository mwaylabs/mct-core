/**
 * Created by pascalbrewing on 30/10/14.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var log = require('mcap-log');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mcapDeploy = require('mcap-deploy');
var GulpUtil = require('../util/gulp.js');

/**
 * Deploy the project to a mcap with the given options.
 *
 * @type {Object} config
 * {
 *  baseurl: 'http://mcap.mway.io',
 *  username: 'mway',
 *  password: 'mway',
 *  rootPath: '/Users/mway/Desktop/helloapp',
 *  progress: funciton() {}
 * }
 */
var Deploy = function (config) {
  assert(config, 'A config parameter is required');
  assert(config.rootPath, 'A config.rootPath parameter is required');
  this.config = config;

  // Check if a client is buildable
  var clientDir = path.join(config.rootPath, 'client', 'gulpfile.js');
  if (!fs.existsSync(clientDir)) {

    // There is no  gulp in the client available
    // so we can skip the build process.
    return this.deploy(false);
  }

  // Yeah, we got a gulpfile, now we can run `gulp build`
  var gulpUtil = new GulpUtil(config.rootPath);

  gulpUtil.on('data', function(data) {
    this.emit('data', data);
  }.bind(this));

  gulpUtil.on('error', function(data) {
    this.emit('error', data);
  }.bind(this));

  gulpUtil.on('exit', function(code) {
    log.debug('Gulp exited with exit code: %s', code);

    if (code > 0) {
      // Somethings goes wrong
      return this.emit('error', new Error('Gulp error'));
    }

    // Build was successfully
    this.deploy(true);
  }.bind(this));

  log.info('Build client...');

  // Build the client
  gulpUtil.run('client', 'build');
};

util.inherits(Deploy, EventEmitter);

Deploy.prototype.deploy = function(hasClient) {

  // Upload the project
  mcapDeploy.deploy(this.config)
  .then(function (endpoint) {
      log.debug('Complete: %s', endpoint);

      var result = {
        server: endpoint
      };

      if (hasClient) {
        result.client = endpoint + 'index.html';
      }

      this.emit('complete', result);
    }.bind(this))
  .catch(function (err) {
      log.debug(err);
      this.emit('error', err);
    }.bind(this));
};

module.exports = function(config) {
  return new Deploy(config);
};
