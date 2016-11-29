'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var gg = require('good-guy-http');
var http = gg({
  cache: false,
  defaultCache: {
    cached: false
  }
});
var moment = require('moment');
var noon = require('noon');
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.iloa.noon';

exports.command = 'wa <query>';
exports.desc = 'Search Wolfram|Alpha';
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
  save: {
    alias: 'v',
    desc: 'Save options to config',
    default: false,
    type: 'boolean'
  },
  assu: {
    alias: 'u',
    desc: "Specifies an assumption, such as the meaning of a word or the value of a formula variable. See the 'Assumptions' section for more details. Optional.",
    default: '',
    type: 'string'
  },
  expod: {
    alias: 'x',
    desc: 'Specifies a pod ID to exclude. You can specify more than one of these elements in the query. Pods with the given IDs will be excluded from the result. Optional.',
    default: '',
    type: 'string'
  },
  fmt: {
    alias: 'm',
    desc: "The desired result format(s). Possible values are 'image,plaintext,minput,moutput,cell,mathml,imagemap,sound,wav' To request more than one format type, separate values with a comma. Optional; defaults to 'plaintext,image'.",
    default: '',
    type: 'string'
  },
  ftime: {
    alias: 'e',
    desc: "The number of seconds to allow Wolfram|Alpha to spend in the 'format' stage for the entire collection of pods. Optional; defaults to 8.0.",
    default: 8.0,
    type: 'number'
  },
  incpod: {
    alias: 'c',
    desc: 'Specifies a pod ID to include. You can specify more than one of these elements in the query. Only pods with the given IDs will be returned.',
    default: '',
    type: 'string'
  },
  loc: {
    alias: 'l',
    desc: "Some Wolfram|Alpha computations take into account the caller's current location. By default, Wolfram|Alpha attempts to determine the caller's location from the IP address, but you can override this by specifying location information in one of three forms. See the 'Specifying Your Location' section for more details. Optional; defaults to determining location via the IP address of the caller.",
    default: '',
    type: 'string'
  },
  prtime: {
    alias: 'r',
    desc: "The number of seconds to allow Wolfram|Alpha to spend in the 'parsing' stage of processing. Optional; defaults to 5.0.",
    default: 5.0,
    type: 'number'
  },
  podid: {
    alias: 'i',
    desc: "Specifies the index of the pod(s) to return. This is an alternative to specifying pods by title or ID. You can give a single number or a sequence like '2,3,5'. Optional; default is all pods.",
    default: '',
    type: 'string'
  },
  podt: {
    alias: 't',
    desc: 'Specifies a pod title. You can specify more than one of these elements in the query. Only pods with the given titles will be returned. You can use * as a wildcard to match zero or more characters in pod titles. Optional.',
    default: '',
    type: 'string'
  },
  pdtime: {
    alias: 'd',
    desc: "The number of seconds to allow Wolfram|Alpha to spend in the 'format' stage for any one pod. Optional; defaults to 4.0.",
    default: 4.0,
    type: 'number'
  },
  scan: {
    alias: 'a',
    desc: 'Specifies that only pods produced by the given scanner should be returned. You can specify more than one of these elements in the query. Optional; default is all pods.',
    default: '',
    type: 'string'
  },
  sig: {
    alias: 'g',
    desc: 'A special signature that can be applied to guard against misuse of your AppID. Optional.',
    default: '',
    type: 'string'
  },
  stime: {
    alias: 's',
    desc: "The number of seconds to allow Wolfram|Alpha to compute results in the 'scan' stage of processing. Optional; defaults to 3.0.",
    default: 3.0,
    type: 'number'
  },
  unit: {
    alias: 'n',
    desc: "Lets you specify the preferred measurement system, either 'metric' or 'nonmetric' (U.S. customary units). Optional; defaults to making a decision based on the caller's geographic location.",
    default: '',
    type: 'string'
  },
  width: {
    alias: 'w',
    desc: "These specifications control the page width in pixels for which the output should be formatted. See the section 'Controlling the Width of Results' for more details. Optional. Default width and maxwidth are 500; default plotwidth is 200; default mag is 1.0.",
    default: '',
    type: 'string'
  },
  async: {
    alias: 'y',
    desc: 'Search asynchronously',
    default: false,
    type: 'boolean'
  },
  fetch: {
    desc: 'Fetch assumptions',
    default: true,
    type: 'boolean'
  },
  icase: {
    desc: 'Whether to force Wolfram|Alpha to ignore case in queries. Optional.',
    default: false,
    type: 'boolean'
  },
  reint: {
    desc: 'Whether to allow Wolfram|Alpha to reinterpret queries that would otherwise not be understood. Optional.',
    default: false,
    type: 'boolean'
  },
  trans: {
    desc: 'Whether to allow Wolfram|Alpha to try to translate simple queries into English. Optional.',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var proceed = false;
  var reset = false;
  var stamp = new Date(config.wolf.date.stamp);
  var days = moment(new Date()).diff(stamp, 'days');
  var hours = moment(new Date()).diff(stamp, 'hours');
  var minutes = moment(new Date()).diff(stamp, 'minutes');
  var checkStamp = tools.limitWolf(config);
  config = checkStamp[0];
  proceed = checkStamp[1];
  reset = checkStamp[2];
  if (proceed) {
    (function () {
      var userConfig = {
        wolf: {
          assu: argv.u,
          expod: argv.x,
          fmt: argv.m,
          ftime: argv.e,
          incpod: argv.c,
          loc: argv.l,
          prtime: argv.r,
          podid: argv.i,
          podt: argv.t,
          pdtime: argv.d,
          scan: argv.a,
          sig: argv.g,
          stime: argv.s,
          unit: argv.n,
          width: argv.w,
          async: argv.y,
          fetch: argv.fetch,
          icase: argv.icase,
          reint: argv.reint,
          trans: argv.trans
        }
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      if (argv.v && config.merge) noon.save(CFILE, config);
      if (argv.v && !config.merge) throw new Error("Can't save user config, set option merge to true.");
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Wolfram|Alpha');
      var wcont = [];
      wcont.push(argv.query);
      if (argv._.length > 1) {
        _.each(argv._, function (value) {
          if (value !== 'wa') wcont.push(value);
        });
      }
      var words = '';
      wcont.length > 1 ? words = wcont.join('+') : words = wcont[0];
      var pcont = [];
      pcont.push('format=' + argv.m);
      pcont.push('includepodid=' + argv.c);
      pcont.push('excludepodid=' + argv.x);
      pcont.push('podtitle=' + argv.t);
      pcont.push('podindex=' + argv.i);
      pcont.push('scanner=' + argv.a);
      pcont.push('async=' + argv.y);
      pcont.push('location%20specifications=' + argv.l);
      pcont.push('assumption=' + argv.u);
      pcont.push('units=' + argv.n);
      pcont.push('width%20specifications=' + argv.w);
      pcont.push('scantimeout=' + argv.s);
      pcont.push('podtimeout=' + argv.d);
      pcont.push('formattimeout=' + argv.e);
      pcont.push('parsetimeout=' + argv.r);
      pcont.push('reinterpret=' + argv.reint);
      pcont.push('translation=' + argv.trans);
      pcont.push('ignorecase=' + argv.icase);
      pcont.push('sig=' + argv.g);
      var apikey = process.env.WOLFRAM;
      var url = encodeURI('http://api.wolframalpha.com/v2/query?input=' + words + '&' + pcont.join('&') + '&appid=' + apikey);
      var tofile = {
        type: 'wolfram-alpha',
        source: 'http://www.wolframalpha.com/'
      };
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          if (response.headers['x-gg-state'] === 'cached' || response.headers['x-gg-state'] === 'stale') throw new Error('Result should not be cached per Wolfram|Alpha TOS.');
          var body = response.body;
          var parser = new xml2js.Parser();
          parser.parseString(body, function (err, result) {
            var q = result.queryresult;
            var pods = q.pod;
            var helpers = require('./helpers/wa');
            tofile = helpers.numPods(pods, tofile);
            if (argv.fetch) tofile = helpers.assume(q.assumptions, tofile);
          });
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (config.usage) reset ? console.log('Timestamp expired, reset usage limits.\n' + config.wolf.date.remain + '/' + config.wolf.date.limit + ' requests remaining this month.') : console.log(config.wolf.date.remain + '/' + config.wolf.date.limit + ' requests remaining this month, will reset in ' + (31 - days) + ' days, ' + (24 - hours) + ' hours, ' + (60 - minutes) + ' minutes.');
        } else {
          throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
        }
      });
    })();
  } else throw new Error('Reached month\'s usage limit of ' + config.wolf.date.limit + '.');
};