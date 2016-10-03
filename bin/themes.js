'use strict';

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _noon = require('noon');

var _noon2 = _interopRequireDefault(_noon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len:0 */
var TDIR = null;
var themeDirExists = null;
try {
  _fs2.default.statSync('themes');
  themeDirExists = true;
} catch (e) {
  if (e.code === 'ENOENT') themeDirExists = false;
}
themeDirExists ? TDIR = 'themes/' : TDIR = process.env.NODE_PATH + '/iloa/themes/';

/**
  * The themes module provides useful repetitive theme tasks
  * @module Themes
  */

/**
  * Loads theme
  * @public
  * @param {string} theme The name of the theme
  * @return {Object} load The style to use
  */
exports.loadTheme = function (theme) {
  var dirExists = null;
  var load = null;
  try {
    _fs2.default.statSync('themes');
    dirExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') dirExists = false;
  }
  if (!dirExists) console.log(_chalk2.default.white(process.cwd() + '/themes does not exist, falling back to ' + process.env.NODE_PATH + '/iloa/themes.'));
  load = _noon2.default.load('' + TDIR + theme + '.noon');
  return load;
};

/**
  * Gets themes for list command
  * @public
  * @return {Array} List of theme names
  */
exports.getThemes = function () {
  var list = [];
  var dirExists = null;
  var files = [];
  try {
    _fs2.default.statSync('themes');
    dirExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') dirExists = false;
  }
  if (!dirExists) console.log(_chalk2.default.white(process.cwd() + '/themes does not exist, falling back to ' + process.env.NODE_PATH + '/iloa/themes.'));
  files = _glob2.default.sync(TDIR + '*.noon');
  (0, _each3.default)(files, function (path) {
    var name = path.replace(/[a-z0-9\/_\.]*themes\//, '').replace(/\.noon/, '');
    list.push(name);
  });
  return list;
};

/**
  * Prints label, connector, and content
  * @public
  * @param {Object} theme The style to use
  * @param {string} direction 'down' or 'right'
  * @param {string} text The label text
  * @param {string} [content] The text the label points at
  * @return {string} The stylized string to log
  */
exports.label = function (theme, direction, text, content) {
  var pstyle = (0, _get3.default)(_chalk2.default, theme.prefix.style);
  var tstyle = (0, _get3.default)(_chalk2.default, theme.text.style);
  var sstyle = (0, _get3.default)(_chalk2.default, theme.suffix.style);
  var cnstyle = (0, _get3.default)(_chalk2.default, theme.connector.style);
  var ctstyle = (0, _get3.default)(_chalk2.default, theme.content.style);
  var label = '' + pstyle(theme.prefix.str) + tstyle(text) + sstyle(theme.suffix.str);
  if (direction === 'right') {
    content !== null && content !== undefined ? label = '' + label + cnstyle(theme.connector.str) + ctstyle(content) : label = '' + label;
  } else if (direction === 'down') {
    content !== null && content !== undefined ? label = label + '\n' + cnstyle(theme.connector.str) + ctstyle(content) : label = '' + label;
  } else {
    throw new Error("Unsupported label direction, use 'down' or 'right'.");
  }
  console.log(label);
  return label;
};