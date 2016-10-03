'use strict';

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _themes = require('../themes');

var _themes2 = _interopRequireDefault(_themes);

var _tools = require('../tools');

var _tools2 = _interopRequireDefault(_tools);

var _goodGuyHttp = require('good-guy-http');

var _goodGuyHttp2 = _interopRequireDefault(_goodGuyHttp);

var _noon = require('noon');

var _noon2 = _interopRequireDefault(_noon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len:0 */
var http = (0, _goodGuyHttp2.default)({
  cache: false,
  defaultCache: {
    cached: false
  }
});

var CFILE = process.env.HOME + '/.iloa.noon';

exports.command = 'wiki <query>';
exports.desc = 'Wikipedia summaries';
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string'
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean'
  },
  intro: {
    alias: 'i',
    desc: 'Just intro or all sections',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  _tools2.default.checkConfig(CFILE);
  var config = _noon2.default.load(CFILE);
  var userConfig = {
    wiki: {
      intro: argv.i
    }
  };
  if (config.merge) config = (0, _merge3.default)({}, config, userConfig);
  if (argv.s && config.merge) _noon2.default.save(CFILE, config);
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
  var theme = _themes2.default.loadTheme(config.theme);
  if (config.verbose) _themes2.default.label(theme, 'down', 'Wikipedia');
  var wcont = [];
  wcont.push(argv.query);
  if (argv._.length > 1) {
    (0, _each3.default)(argv._, function (value) {
      if (value !== 'wiki') wcont.push(value);
    });
  }
  var words = '';
  if (wcont.length > 1) {
    words = wcont.join('+');
  } else {
    words = wcont[0];
  }
  var prefix = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&indexpageids&redirects=1&continue=&explaintext=';
  if (argv.i) prefix = prefix + '&exintro=';
  var url = prefix + '&titles=' + words;
  url = encodeURI(url);
  var tofile = {
    type: 'wiki',
    source: 'http://www.wikipedia.org/',
    url: url
  };
  http({ url: url }, function (error, response) {
    if (!error && response.statusCode === 200) {
      var body = JSON.parse(response.body);
      if (body.query.pageids[0] === '-1') {
        if (body.query.normalized) {
          var fixed = body.query.normalized[0];
          console.log('Query normalized from ' + fixed.from + ' to ' + fixed.to + ', try searching again.');
          process.exit(0);
        } else {
          console.log('No Wikipedia article found for ' + wcont.join(' ') + ', try searching again.');
          process.exit(0);
        }
      }
      var pageID = body.query.pageids[0];
      var page = body.query.pages[pageID];
      var plain = page.extract.trim();
      var wrapped = _tools2.default.wrapStr(plain, 80, false);
      _themes2.default.label(theme, 'down', 'Summary', wrapped);
      tofile.summary = plain;
      if (argv.o) _tools2.default.outFile(argv.o, argv.f, tofile);
    } else {
      throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
    }
  });
};