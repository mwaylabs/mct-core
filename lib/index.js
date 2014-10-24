/*
 * common
 * https://github.com/mwaylabs/common
 *
 * Copyright (c) 2014 M-Way Solutions GmbH
 * Licensed under the MIT license.
 */

'use strict';

var createProject = require('./create-project.js');

var _createProject = function _createProject () {

  createProject(function() {
    console.log('createProject', arguments);
  });
};

module.exports = {
  createProject: _createProject
};

