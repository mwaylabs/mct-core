/*
 * mct-core
 * https://github.com/mwaylabs/mct-core
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('mway:mct-core:createProject');
var _ = require('lodash');
var async = require('async');
var Yo = require('../util/yo.js');
var generatorPath = require('../util/generator-path.js');

/**
 * Install dependencies for the given generator
 *
 * @param  {Object}   options See getGeneratorTasks() options
 * @param  {Function} cb
 */
var runInstall = function(options, cb) {
  var previousWorkingDirectory = process.cwd();
  var cwd = generatorPath.basePath(options.generator);
  if (!cwd) {
    throw new Error('Path not found for generator "' + options.generator + '"');
  }

  debug('Run generator install in %s', cwd);

  process.chdir(cwd);
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
      restoreCwd: false,
      opts: function() {
        if (options.name) {
          return {
            name: options.name
          };
        }
        return {};
      },
      afterRun: function(options, cb) {
        var mcapManifestFile = path.resolve(process.cwd(), 'mcap.json');
        debug('Read manifest file %s', mcapManifestFile);
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
      opts: function() {
        return {
          name: mcapManifest.name
        };
      }
    },
    {
      generator: 'm',
      install: true,
      opts: function() {
        return {
          'app-name': mcapManifest.name
        };
      },
      afterRun: function(options, cb) {
        // Delete git files because the client is just a
        // sub folder from the project and only the root
        // folder should contains these files.
        var deleteFiles = ['.gitattributes', '.gitignore'];
        var genBasePath = generatorPath.basePath(options.generator);
        deleteFiles = deleteFiles.map(function(file) {
          return path.join(genBasePath, file);
        });
        async.mapSeries(deleteFiles, fs.unlink, cb);
      }
    }
  ];
};

/**
 * Execute generator in order and at the end run npm install
 *
 * @param  {Yo}      yo
 * @param  {Object}  options See constructor options
 * @param  {Funtion} cb
 */
var runGenerators = function(yo, options, cb) {

  var tasks = getGeneratorTasks(options);

  var runYeoman = function(options, cb) {
    yo.run(options.generator, options, function(err, instance) {
      if (err) {
        return cb(err);
      }
      options.instance = instance;
      if (typeof options.afterRun === 'function') {
        options.afterRun(options, function() {
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

  // Execute generators in order
  async.mapSeries(tasks, runYeoman, function(err, generators) {
    if (err) {
      return cb(err);
    }
    if (options.skipInstall) {
      return cb(null);
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
 * @property {Boolean}  skipInstall - Skip npm and bower install
 * @param {Function} cb
 */
module.exports = function (options, cb) {
  options = options || {};
  cb = _.isFunction(cb) ? cb : function () {};

  var yo = new Yo();

  // Search for local generators
  yo.lookup(function() {
    runGenerators(yo, options, function(err) {
      if (err) {
        return cb(err);
      }
      var projectSummary = {
        basePath: process.cwd()
      };
      cb(null, projectSummary);
    });
  });
};
