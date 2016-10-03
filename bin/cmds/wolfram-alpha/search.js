'use strict';

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _themes = require('../../themes');

var _themes2 = _interopRequireDefault(_themes);

var _tools = require('../../tools');

var _tools2 = _interopRequireDefault(_tools);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _goodGuyHttp = require('good-guy-http');

var _goodGuyHttp2 = _interopRequireDefault(_goodGuyHttp);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _noon = require('noon');

var _noon2 = _interopRequireDefault(_noon);

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len:0 */
var http = (0, _goodGuyHttp2.default)({
  cache: false,
  defaultCache: {
    cached: false
  }
});


var CFILE = process.env.HOME + '/.iloa.noon';

exports.command = 'search <query>';
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
  _tools2.default.checkConfig(CFILE);
  var config = _noon2.default.load(CFILE);
  var proceed = false;
  var reset = false;
  var stamp = new Date(config.wolf.date.stamp);
  var days = (0, _moment2.default)(new Date()).diff(stamp, 'days');
  var hours = (0, _moment2.default)(new Date()).diff(stamp, 'hours');
  var minutes = (0, _moment2.default)(new Date()).diff(stamp, 'minutes');
  var checkStamp = _tools2.default.limitWolf(config);
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
      if (config.merge) config = (0, _merge3.default)({}, config, userConfig);
      if (argv.v && config.merge) _noon2.default.save(CFILE, config);
      if (argv.v && !config.merge) throw new Error("Can't save user config, set option merge to true.");
      var theme = _themes2.default.loadTheme(config.theme);
      if (config.verbose) _themes2.default.label(theme, 'down', 'Wolfram|Alpha');
      var wcont = [];
      wcont.push(argv.query);
      if (argv._.length > 1) {
        (0, _each3.default)(argv._, function (value) {
          if (value !== 'wolf') wcont.push(value);
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
          var parser = new _xml2js2.default.Parser();
          parser.parseString(body, function (err, result) {
            var q = result.queryresult;
            var pods = q.pod;
            _helpers2.default.numPods(pods);
            if (argv.fetch) _helpers2.default.assume(q.assumptions);
          });
          if (argv.o) _tools2.default.outFile(argv.o, argv.f, tofile);
          if (config.usage) reset ? console.log('Timestamp expired, reset usage limits.\n' + config.wolf.date.remain + '/' + config.wolf.date.limit + ' requests remaining this month.') : console.log(config.wolf.date.remain + '/' + config.wolf.date.limit + ' requests remaining this month, will reset in ' + (31 - days) + ' days, ' + (24 - hours) + ' hours, ' + (60 - minutes) + ' minutes.');
        } else {
          throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
        }
      });
    })();
  } else throw new Error('Reached month\'s usage limit of ' + config.wolf.date.limit + '.');
};