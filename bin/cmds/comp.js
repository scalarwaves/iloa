'use strict';

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.command = 'comp'; /* eslint no-unused-vars:0, no-unused-expressions:0 */

exports.desc = 'Print shell completion script';
exports.builder = {};
exports.handler = function (argv) {
  _yargs2.default.showCompletionScript().argv;
};