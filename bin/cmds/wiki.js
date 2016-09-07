'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var http = require('good-guy-http')();
var noon = require('noon');

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
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.label(theme, 'down', 'Wikipedia');
  var wcont = [];
  wcont.push(argv.query);
  if (argv._.length > 1) {
    _.each(argv._, function (value) {
      if (value !== 'wiki') wcont.push(value);
    });
  }
  var words = '';
  if (wcont.length > 1) {
    words = wcont.join('+');
  } else {
    words = wcont[0];
  }
  var url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&indexpageids&redirects=1&explaintext=&titles=' + words;
  url = encodeURI(url);
  var tofile = {
    type: 'wiki',
    source: 'http://www.wikipedia.org/',
    url: url
  };
  http({ url: url }, function (error, response) {
    if (!error && response.statusCode === 200) {
      var body = JSON.parse(response.body);
      var pageID = body.query.pageids[0];
      var page = body.query.pages[pageID];
      themes.label(theme, 'down', 'Summary', page.extract.trim());
      tofile['summary'] = page.extract.trim();
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
    } else {
      throw new Error('HTTP ' + response.statusCode + ': ' + error);
    }
  });
};