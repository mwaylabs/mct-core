/**
 * Created by pascalbrewing on 30/10/14.
 */
'use strict';

var assert = require('assert');
var debug = require('debug')('mway:mct-core:deploy');
var _ = require('lodash');
var mcapDeploy = require('mcap-deploy');

module.exports = function (config, cb) {

  assert(config, 'A config parameter is required');
  cb = _.isFunction(cb) ? cb : function () {};

  mcapDeploy.deploy(config).then(function (endpoint) {
    debug('Complete: %s', endpoint);

    cb(null, {
      client: endpoint + 'index.html',
      server: endpoint + 'api/'
    });

  }).catch(function (err) {
    debug('Error: %o', err);
    cb(err);
  });
};
