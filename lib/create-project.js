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

var runYo = function(options, cb) {
  if (typeof options.opts === 'function') {
    options.opts = options.opts();
  }

  options.opts = options.opts || {};
  options.opts['skip-install'] = true;
  options.opts['skip-welcome-message'] = true;

  debug('Run generator %s in %s', options.generator, options.cwd);
  process.chdir(options.cwd);
  options.instance = env.run(options.generator, options.opts, function(err) {
    if (err) {
      return cb(err);
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

var runInstall = function(options, cb) {
  debug('Run generator install in %s', options.cwd);
  process.chdir(options.cwd);
  options.instance.installDependencies(cb);
};

module.exports = function (cb) {

  // TODO create project folder

  env.on('error', function (err) {
    debug('error %s', err.message);
    cb(err);
  });

  env.getNpmPaths = function() {
    return [path.resolve(__dirname, '../node_modules')];
  };

  env.lookup(function () {

    var mcapManifest = null;

    var tasks = [
      {
        generator: 'mcap',
        install: false,
        cwd: path.resolve(process.cwd(), './'),
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
        cwd: path.resolve(process.cwd(), './server'),
        opts: function() {
          return {
            name: mcapManifest.name
          };
        }
      },
      {
        generator: 'm',
        install: true,
        cwd: path.resolve(process.cwd(), './client'),
        opts: function() {
          return {
            'app-name': mcapManifest.name
          };
        }
      }
    ];

    // Execute generators in order
    async.mapSeries(tasks, runYo, function(err, generators) {
      if (err) {
        return cb(err);
      }

      // Strip out generators with install: false
      generators = _.filter(generators, function(item) {
        return item.install;
      });

      // Run npm install
      async.mapSeries(generators, runInstall, cb);
    });
  });
};
