'use strict';

var _themes = require('../../themes');

var _themes2 = _interopRequireDefault(_themes);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _noon = require('noon');

var _noon2 = _interopRequireDefault(_noon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CFILE = process.env.HOME + '/.iloa.noon';
var PKGDIR = process.env.NODE_PATH + '/iloa/';

exports.command = 'init';
exports.desc = 'Initialize config file';
exports.builder = {
  force: {
    alias: 'f',
    desc: 'Force overwriting configuration file',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  var obj = null;
  var configExists = null;
  var dirExists = null;
  try {
    _fs2.default.statSync('default.config.noon');
    configExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') configExists = false;
  }
  if (configExists) {
    obj = _noon2.default.load('default.config.noon');
  } else {
    try {
      _fs2.default.statSync(PKGDIR);
      dirExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        dirExists = false;
      }
    }
    if (dirExists) {
      obj = _noon2.default.load(PKGDIR + 'default.config.noon');
    } else {
      throw new Error('Package dir not found, set NODE_PATH per documentation.');
    }
  }
  obj.wolf.date.stamp = new Date().toJSON();
  var fileExists = null;
  try {
    _fs2.default.statSync(CFILE);
    fileExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      fileExists = false;
    }
  }
  if (fileExists) {
    if (argv.f) {
      var _config = _noon2.default.load(CFILE);
      obj.wolf.date.stamp = _config.wolf.date.stamp;
      obj.wolf.date.remain = _config.wolf.date.remain;
      _noon2.default.save(CFILE, obj);
      console.log('Overwrote ' + _chalk2.default.white.bold(CFILE) + '.');
    } else {
      console.log('Using configuration at ' + _chalk2.default.white.bold(CFILE) + '.');
    }
  } else if (!fileExists) {
    _noon2.default.save(CFILE, obj);
    console.log('Created ' + _chalk2.default.white.bold(CFILE) + '.');
  }
  var config = _noon2.default.load(CFILE);
  var theme = _themes2.default.loadTheme(config.theme);
  if (argv.v) {
    _themes2.default.label(theme, 'down', 'Configuration');
    console.log('Your current configuration is:');
    console.log(_noon2.default.stringify(config, {
      indent: 2,
      align: true,
      maxalign: 32,
      sort: true,
      colors: true
    }));
    console.log('');
  }
};