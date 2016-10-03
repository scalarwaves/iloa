'use strict';

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _noon = require('noon');

var _noon2 = _interopRequireDefault(_noon);

var _wrapAnsi = require('wrap-ansi');

var _wrapAnsi2 = _interopRequireDefault(_wrapAnsi);

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len: 0 */
var CFILE = process.env.HOME + '/.iloa.noon';

/**
  * The tools module provides useful repetitive tasks
  * @module Utils
  */

/**
  * Wolfram|Alpha's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */
exports.limitWolf = function (config) {
  var c = config;
  var proceed = false;
  var reset = false;
  var stamp = new Date(c.wolf.date.stamp);
  var days = (0, _moment2.default)(new Date()).diff(stamp, 'days');
  if (days < 31) {
    c.wolf.date.remain--;
  } else if (days >= 31) {
    reset = true;
    c.wolf.date.stamp = new Date().toJSON();
    c.wolf.date.remain = c.wolf.date.limit;
    c.wolf.date.remain--;
  }
  c.wolf.date.remain <= 0 ? c.wolf.date.remain = 0 : proceed = true;
  _noon2.default.save(CFILE, c);
  return [c, proceed, reset];
};

/**
  * Checks if a file exists
  * @private
  * @param {string} path The filename to check.
  * @return {boolean} fileExists
  */
function checkOutfile(path) {
  var fileExists = null;
  try {
    _fsExtra2.default.statSync(path);
    fileExists = true;
  } catch (e) {
    if (e.code === 'ENOENT') fileExists = false;
  }
  return fileExists;
}

/**
  * Converts string to boolean
  * @public
  * @param {string} value
  * @return {boolean} v
  */
exports.checkBoolean = function (value) {
  var v = value;
  if (v === 'true') v = true;
  if (v === 'false') v = false;
  return v;
};

/**
  * Checks if config exists. If not, prints init message and exits with error code.
  * @public
  * @param {string} file Configuration filepath
  */
exports.checkConfig = function (file) {
  try {
    _fsExtra2.default.statSync(file);
  } catch (e) {
    if (e.code === 'ENOENT') throw new Error('No config found at ' + file + ', run: \'iloa config init\'');
  }
  return true;
};

/**
  * Checks if object is a single string in an array
  * @public
  * @param {Object} obj Any object
  * @return {Object} Original object or extracted string
  */
exports.arrToStr = function (obj) {
  var fixed = null;
  Array.isArray(obj) && obj.length === 1 && typeof obj[0] === 'string' ? fixed = obj[0] : fixed = obj;
  return fixed;
};

/**
  * Strips HTML from a string
  * @public
  * @param  {string} string Text with HTML tags
  * @return {string} Plain text string
  */
exports.stripHTML = function (string) {
  return string.replace(/(<([^>]+)>)/ig, '');
};

/**
  * Wraps blocks of text
  * @param  {string} str Long string
  * @param  {number} col Number of columns
  * @param  {boolean} hard true, soft false
  * @return {string} ANSI-wrapped string
  */
exports.wrapStr = function (str, col, hard) {
  return (0, _wrapAnsi2.default)(str, col, hard);
};

/**
  * Handles data export to file. Supports cson, json, noon, plist, xml, yaml.
  * @public
  * @param {string} path The desired filepath and extension
  * @param {boolean} force Whether to force overwrite
  * @param {Object} tofile A numbered object of data points
  */
exports.outFile = function (path, force, tofile) {
  var match = path.match(/\.([a-z]*)$/i);
  var ext = match[1];
  var builder = new _xml2js2.default.Builder();
  if (ext === 'xml') {
    if (checkOutfile(path)) {
      if (force) {
        var xml = builder.buildObject(tofile);
        var fd = _fsExtra2.default.openSync(path, 'w+');
        _fsExtra2.default.writeSync(fd, xml);
        _fsExtra2.default.closeSync(fd);
        console.log(_chalk2.default.white('Overwrote ' + path + ' with data.'));
      } else console.log(_chalk2.default.white(path + ' exists, use -f to force overwrite.'));
    } else {
      var _xml = builder.buildObject(tofile);
      var _fd = _fsExtra2.default.openSync(path, 'w+');
      _fsExtra2.default.writeSync(_fd, _xml);
      _fsExtra2.default.closeSync(_fd);
      console.log(_chalk2.default.white('Wrote data to ' + path + '.'));
    }
  } else if (ext === 'cson' || ext === 'json' || ext === 'noon' || ext === 'plist' || ext === 'yml' || ext === 'yaml') {
    if (checkOutfile(path)) {
      if (force) {
        _noon2.default.save(path, tofile);
        console.log(_chalk2.default.white('Overwrote ' + path + ' with data.'));
      } else console.log(_chalk2.default.white(path + ' exists, use -f to force overwrite.'));
    } else {
      _noon2.default.save(path, tofile);
      console.log(_chalk2.default.white('Wrote data to ' + path + '.'));
    }
  } else if (ext !== 'xml' || ext !== 'cson' || ext !== 'json' || ext !== 'noon' || ext !== 'plist' || ext !== 'yml' || ext !== 'yaml') throw new Error('Format ' + ext + ' not supported.');
};