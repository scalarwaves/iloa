'use strict';

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _themes = require('../themes');

var _themes2 = _interopRequireDefault(_themes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sample = 'Morbi ornare pulvinar metus, non faucibus arcu ultricies non.'; /* eslint no-unused-vars: 0 */


exports.command = 'ls';
exports.desc = 'Get a list of installed themes';
exports.builder = {};
exports.handler = function (argv) {
  var list = _themes2.default.getThemes();
  (0, _each3.default)(list, function (value) {
    var name = value;
    var currentTheme = _themes2.default.loadTheme(name);
    _themes2.default.label(currentTheme, 'down', name, sample);
  });
};