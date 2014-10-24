/*
 * common
 * https://github.com/mwaylabs/common
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var debug = require('debug')('mct:createProject');
var _ = require('lodash');
var async = require('async');
var env = require('yeoman-environment').createEnv();

var runYo = function(options, cb) {
  options.opts = options.opts || {};
  options.opts['skip-install'] = true;

  debug('Run generator %s in %s', options.generator, options.cwd);
  process.chdir(options.cwd);
  options.instance = env.run(options.generator, options.opts, function(err) {
    if (err) {
      return cb(err);
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

    var tasks = [
      {
        generator: 'mcap',
        install: false,
        cwd: path.resolve(process.cwd(), './'),
      },
      {
        generator: 'm-server',
        install: true,
        cwd: path.resolve(process.cwd(), './server')
      },
      {
        generator: 'm',
        install: true,
        cwd: path.resolve(process.cwd(), './client')
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
