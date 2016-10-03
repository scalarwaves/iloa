'use strict';

var _themes = require('../../themes');

var _themes2 = _interopRequireDefault(_themes);

var _tools = require('../../tools');

var _tools2 = _interopRequireDefault(_tools);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _dotty = require('dotty');

var _dotty2 = _interopRequireDefault(_dotty);

var _noon = require('noon');

var _noon2 = _interopRequireDefault(_noon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CFILE = process.env.HOME + '/.iloa.noon';

exports.command = 'get <key>';
exports.desc = 'Retrieve a config value';
exports.builder = {};
exports.handler = function (argv) {
  var key = argv.key;
  var value = null;
  _tools2.default.checkConfig(CFILE);
  var config = _noon2.default.load(CFILE);
  var theme = _themes2.default.loadTheme(config.theme);
  if (config.verbose) _themes2.default.label(theme, 'down', 'Configuration');
  if (_dotty2.default.exists(config, key)) {
    value = /\./i.test(key) ? _dotty2.default.get(config, key) : config[key];
  } else {
    throw new Error('Option ' + key + ' not found.');
  }
  console.log('Option ' + _chalk2.default.white.bold(key) + ' is ' + _chalk2.default.white.bold(value) + '.');
};