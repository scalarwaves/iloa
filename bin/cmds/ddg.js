'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var http = require('good-guy-http')();
var noon = require('noon');

var CFILE = process.env.HOME + '/.iloa.noon';

exports.command = 'ddg <query>';
exports.desc = 'DuckDuckGo Instant Answers';
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
  if (config.verbose) themes.label(theme, 'down', 'DuckDuckGo');
  var dcont = [];
  dcont.push(argv.query);
  if (argv._.length > 1) {
    _.each(argv._, function (value) {
      if (value !== 'ddg') dcont.push(value);
    });
  }
  var words = '';
  if (dcont.length > 1) {
    words = dcont.join('+');
  } else {
    words = dcont[0];
  }
  var url = 'https://api.duckduckgo.com/?q=' + words + '&format=json&pretty=1&no_redirect=1&t=iloa';
  url = encodeURI(url);
  var tofile = {
    type: 'duckduckgo',
    source: 'https://www.duckduckgo.com/',
    url: url
  };
  http({ url: url }, function (error, response) {
    if (!error && response.statusCode === 200) {
      var blank = {
        DefinitionSource: '',
        Heading: '',
        ImageWidth: '',
        RelatedTopics: [],
        Entity: '',
        meta: null,
        Type: '',
        Redirect: '',
        DefinitionURL: '',
        AbstractURL: '',
        Definition: '',
        AbstractSource: '',
        Infobox: '',
        Image: '',
        ImageIsLogo: '',
        Abstract: '',
        AbstractText: '',
        AnswerType: '',
        ImageHeight: '',
        Answer: '',
        Results: []
      };
      var body = JSON.parse(response.body);
      if (body.Abstract === '' && body.Answer === '' && body.meta !== null) {
        console.log('Only metadata was returned:');
        console.log(JSON.stringify(body.meta, null, 2));
        process.exit(0);
      }
      if (JSON.stringify(body) === JSON.stringify(blank)) {
        console.log('DuckDuckGo found no results.');
        process.exit(0);
      }
      if (body.Type === 'E' && body.Redirect !== '') {
        console.log('!bang redirect to ' + body.Redirect);
        process.exit(0);
      }
      var rtype = null;
      if (body.Type !== '') {
        if (body.Type === 'A') rtype = 'Article';
        if (body.Type === 'C') rtype = 'Category';
        if (body.Type === 'D') rtype = 'Disambiguation';
        if (body.Type === 'N') rtype = 'Name';
      } else rtype = body.Type;
      tofile.answerType = body.AnswerType;
      if (body.AnswerType === 'calc') {
        themes.label(theme, 'right', 'Calculation');
        console.log(tools.stripHTML(body.Answer));
        process.exit(0);
      }
      if (body.AnswerType === 'phone') {
        themes.label(theme, 'right', 'Phone number');
        var href = body.Answer.match(/<a href="(http:\/\/[a-z0-9./?=]*) *">/i);
        console.log(tools.stripHTML(body.Answer) + ': ' + href[1]);
        process.exit(0);
      }
      if (body.AnswerType === 'unicode' || body.AnswerType === 'unicode_conversion') {
        themes.label(theme, 'right', 'Unicode conversion');
        console.log(body.Answer);
        process.exit(0);
      }
      if (rtype !== '') themes.label(theme, 'right', 'Type', rtype);
      tofile.responseType = rtype;
      if (rtype === 'Article') {
        themes.label(theme, 'right', 'Title', body.Heading);
        themes.label(theme, 'right', 'Entity', body.Entity);
        themes.label(theme, 'right', 'Source', body.AbstractSource);
        themes.label(theme, 'right', 'URL', body.AbstractURL);
        themes.label(theme, 'right', 'Text', tools.wrapStr(body.AbstractText, true, true));
        if (body.Results.length > 0) {
          themes.label(theme, 'down', 'Primary Results');
          for (var i = 0; i <= body.Results - 1; i++) {
            var res = body.Results[i];
            console.log(res.Text + '\n' + res.FirstURL);
            tofile[['resultText' + i]] = res.Text;
            tofile[['resultUrl' + i]] = res.FirstURL;
          }
        }
        tofile.title = body.Heading;
        tofile.entity = body.Entity;
        tofile.abstractSource = body.AbstractSource;
        tofile.abstractUrl = body.AbstractURL;
        tofile.text = body.AbstractText;
      }
      if (rtype === 'Category' || rtype === 'Disambiguation') {
        themes.label(theme, 'right', 'Title', body.Heading);
        themes.label(theme, 'right', 'Source', body.AbstractSource);
        themes.label(theme, 'right', 'URL', body.AbstractURL);
        tofile.title = body.Heading;
        tofile.abstractSource = body.AbstractSource;
        tofile.abstractUrl = body.AbstractURL;
      }
      if (body.Image) {
        themes.label(theme, 'right', 'Image URL', body.Image);
        tofile.image = body.Image;
      }
      if (body.RelatedTopics !== []) {
        var rtArray = body.RelatedTopics;
        var rcont = [];
        var tcont = [];
        for (var _i = 0; _i <= rtArray.length - 1; _i++) {
          var hash = rtArray[_i];
          if (hash.Result !== undefined) {
            rcont.push(hash);
          } else if (hash.Name !== undefined) {
            tcont.push(hash);
          }
        }
        if (rcont !== []) {
          themes.label(theme, 'down', 'Related');
          for (var _i2 = 0; _i2 <= rcont.length - 1; _i2++) {
            var rhash = rcont[_i2];
            console.log(tools.wrapStr(rhash.Text, true, true) + '\n' + rhash.FirstURL);
            tofile[['relatedText' + _i2]] = rhash.Text;
            tofile[['relatedUrl' + _i2]] = rhash.FirstURL;
          }
        }
        if (tcont !== []) {
          for (var _i3 = 0; _i3 <= tcont.length - 1; _i3++) {
            var thash = tcont[_i3];
            themes.label(theme, 'right', 'Topics', thash.Name);
            tofile[['topicName' + _i3]] = thash.Name;
            var tArray = thash.Topics;
            for (var j = 0; j <= tArray.length - 1; j++) {
              var tResult = tArray[j];
              console.log(tResult.Text + '\n' + tResult.FirstURL);
              tofile[['topicText' + _i3]] = tResult.Text;
              tofile[['topicUrl' + _i3]] = tResult.FirstURL;
            }
          }
        }
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
    } else {
      throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
    }
  });
};