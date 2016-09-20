'use strict';

/* eslint max-len: 0 */
var chalk = require('chalk');
var fs = require('fs-extra');
var noon = require('noon');
var wrap = require('wrap-ansi');
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.iloa.noon';

/**
  * The tools module provides useful repetitive tasks
  * @module Utils
  */

/**
  * Checks if a file exists
  * @private
  * @param {string} path The filename to check.
  * @return {boolean} fileExists
  */
function checkOutfile(path) {
  var fileExists = null;
  try {
    fs.statSync(path);
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
    fs.statSync(file);
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
  return wrap(str, col, hard);
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
  var builder = new xml2js.Builder();
  if (ext === 'xml') {
    if (checkOutfile(path)) {
      if (force) {
        var xml = builder.buildObject(tofile);
        var fd = fs.openSync(path, 'w+');
        fs.writeSync(fd, xml);
        fs.closeSync(fd);
        console.log(chalk.white('Overwrote ' + path + ' with data.'));
      } else console.log(chalk.white(path + ' exists, use -f to force overwrite.'));
    } else {
      var _xml = builder.buildObject(tofile);
      var _fd = fs.openSync(path, 'w+');
      fs.writeSync(_fd, _xml);
      fs.closeSync(_fd);
      console.log(chalk.white('Wrote data to ' + path + '.'));
    }
  } else if (ext === 'cson' || ext === 'json' || ext === 'noon' || ext === 'plist' || ext === 'yml' || ext === 'yaml') {
    if (checkOutfile(path)) {
      if (force) {
        noon.save(path, tofile);
        console.log(chalk.white('Overwrote ' + path + ' with data.'));
      } else console.log(chalk.white(path + ' exists, use -f to force overwrite.'));
    } else {
      noon.save(path, tofile);
      console.log(chalk.white('Wrote data to ' + path + '.'));
    }
  } else if (ext !== 'xml' || ext !== 'cson' || ext !== 'json' || ext !== 'noon' || ext !== 'plist' || ext !== 'yml' || ext !== 'yaml') throw new Error('Format ' + ext + ' not supported.');
};