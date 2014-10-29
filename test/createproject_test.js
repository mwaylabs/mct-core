'use strict';

var mctCore = require('../lib/create-project.js');
var path = require('path');
var assert = require('./assert');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var sinon = require('sinon');
var yeoman  = require('yeoman-generator');
var helpers = yeoman.test;

var executeYoStub = function(options, cb) {
  var answers, subGen = [];

  if (options.generator === 'm') {
    options.opts['skip-sdk'] = true;
    answers = {
      'appId': 'com.mwaysolutions.helloapp',
      'bowerPackages': [
        'angular-dynamic-locale#~0.1.17'
      ],
      'platforms': [
        'ios',
        'android'
      ],
      'plugins': [
        'org.apache.cordova.device'
      ]
    };
    subGen = [ // configure path to  subgenerators
      path.join(__dirname, '../node_modules/generator-m/controller'),
      path.join(__dirname, '../node_modules/generator-m/partial'),
      path.join(__dirname, '../node_modules/generator-m/service')
    ];
  }

  helpers.run('generator-' + options.generator)
  .withPrompt(answers)
  .withOptions(options.opts)
  .withGenerators(subGen)
  .on('end', cb);
};

describe('.createProject()', function () {
  var stubExecuteYo;
  this.timeout(5000);

  beforeEach(function(done) {

    stubExecuteYo = sinon.stub(mctCore, 'executeYo', executeYoStub);

    var dir = path.resolve('./test/temp');
    process.chdir('/');
    rimraf(dir, function (err) {
      if (err) {
        return done(err);
      }
      mkdirp.sync(dir);
      process.chdir(dir);
      done();
    });
  });

  afterEach(function() {
    stubExecuteYo.restore();
  });

  it('generate expected files', function (done) {
    mctCore.run({
      name: 'HalloApp',
      skipInstall: true,
    }, function() {

      var expectedFiles = [
        'mcap.json',
        'client/bower.json',
        'server/package.json'
      ];

      var expectedContent = [
        ['mcap.json', /"name": "HalloApp"/],
        ['client/bower.json', /"name": "HalloApp"/],
        ['server/package.json', /"name": "HalloApp"/]
      ];

      assert.file(expectedFiles);
      assert.fileContent(expectedContent);
      done();
    });
  });

});
