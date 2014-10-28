/*
 * common
 * https://github.com/mwaylabs/common
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('mct:createProject');
var _ = require('lodash');
var async = require('async');
var env = require('yeoman-environment').createEnv();

/**
 * Run a yeoman generator with the given options
 *
 * @param  {Object}   options See getGeneratorTasks() options
 * @param  {Function} cb
 */
var runYo = function(options, cb) {
  var previousWorkingDirectory;

  if (typeof options.opts === 'function') {
    options.opts = options.opts();
  }

  options.opts = options.opts || {};
  options.opts['skip-install'] = true;
  options.opts['skip-welcome-message'] = true;

  debug('Run generator %s', options.generator);
  if (options.cwd) {
    debug('Change directory to %s', options.cwd);
    previousWorkingDirectory = process.cwd();
    process.chdir(options.cwd);
  }

  options.instance = env.run(options.generator, options.opts, function(err) {
    if (err) {
      return cb(err);
    }
    if (previousWorkingDirectory) {
      process.chdir(previousWorkingDirectory);
    }
    if (typeof options.afterRun === 'function') {
      options.afterRun(function() {
        if (err) {
          return cb(err);
        }
        cb(null, options);
      });
      return;
    }

    cb(null, options);
  });
};

/**
 * Install dependencies for the given generator
 *
 * @param  {Object}   options See getGeneratorTasks() options
 * @param  {Function} cb
 */
var runInstall = function(options, cb) {
  debug('Run generator install in %s', options.cwd);

  var previousWorkingDirectory = process.cwd();
  process.chdir(options.cwd);
  options.instance.installDependencies(function() {
    process.chdir(previousWorkingDirectory);
    cb();
  });
};

/**
 * Return the task / generator description for the further processing
 *
 * @param  {Object} options See constructor object
 * @return {Object}         Task configuration for runGenerators()
 *
 * @property {String}  generator - The generator name
 * @property {Boolean}  install - Determine if installDependencies should be triggered or not
 * @property {String}  cwd - The target location
 * @property {Object|Function}  opts - The options for the generator
 * @property {Function}  afterRun - Will be called when generator was successfully executed
 * @property {Generator}  instance - The generator instance
 */
var getGeneratorTasks = function(options) {
  var mcapManifest = null;
  return [
    {
      generator: 'mcap',
      install: false,
      opts: function() {
        if (options.name) {
          return {
            name: options.name
          };
        }
        return {};
      },
      afterRun: function(cb) {
        var mcapManifestFile = path.resolve(process.cwd(), 'mcap.json');
        fs.readFile(mcapManifestFile, function(err, content) {
          if (err) {
            return cb(err);
          }
          try {
            mcapManifest = JSON.parse(content);
            cb(null);
          } catch (e) {
            return cb(e);
          }
        });
      }
    },
    {
      generator: 'm-server',
      install: true,
      cwd: './server',
      opts: function() {
        return {
          name: mcapManifest.name
        };
      }
    },
    {
      generator: 'm',
      install: true,
      cwd: './client',
      opts: function() {
        return {
          'app-name': mcapManifest.name
        };
      }
    }
  ];
};

/**
 * Execute generator in order and at the end run npm install
 *
 * @param  {Object}   options See constructor options
 * @param  {Funtion} cb
 */
var runGenerators = function(options, cb) {

  var tasks = getGeneratorTasks(options);

  // Execute generators in order
  async.mapSeries(tasks, runYo, function(err, generators) {
    if (err) {
      return cb(err);
    }

    // Strip out generators with install: false
    generators = _.filter(generators, function(item) {
      return item.install;
    });

    // Run npm install for each generator
    async.mapSeries(generators, runInstall, cb);
  });
};

/**
 * The `CreateProject` class provides the API to create a
 * new mCAP project. Under the hood it runs these child generator, in order:
 *
 * - generator-mcap  - for the project structure and files like `mcap.json` http://github.com/mwaylabs/generator-mcap
 * - generator-m-server - for the server part http://github.com/mwaylabs/generator-m-server
 * - generator-m – for the client part http://github.com/mwaylabs/generator-m
 *
 * @constructor
 * @param {Object} options
 * @property {String}  name - The project name
 * @param {Function} cb
 */
module.exports = function (options, cb) {
  options = options || {};
  cb = _.isFunction(cb) ? cb : function () {};

  env.on('error', function (err) {
    debug('error %s', err.message);
    cb(err);
  });

  // Get only local installed generators
  env.getNpmPaths = function() {
    return [path.resolve(__dirname, '../node_modules')];
  };

  // Search for local generators
  env.lookup(function() {
    runGenerators(options, cb);
  });
};
