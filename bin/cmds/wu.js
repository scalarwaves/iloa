'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var moment = require('moment');
var noon = require('noon');
var http = require('good-guy-http')({
  cache: false
});

var CFILE = process.env.HOME + '/.iloa.noon';

exports.command = 'wu <query>';
exports.desc = 'Query Weather Underground';
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
  features: {
    alias: 'e',
    desc: 'CSV alerts,almanac,animatedradar,animatedsatellite,animatedradar/animatedsatellite,astronomy,conditions,currenthurricane,forecast,forecast10day,geolookup,history,hourly,hourly10day,planner,radar,radar/satellite,rawtide,satellite,tide,webcams,yesterday',
    default: 'conditions',
    type: 'string'
  },
  lang: {
    alias: 'l',
    desc: '2-letter language codes listed here: https://www.wunderground.com/weather/api/d/docs?d=language-support',
    default: 'EN',
    type: 'string'
  },
  pws: {
    alias: 'p',
    desc: 'Use personal weather stations for weather conditions',
    default: true,
    type: 'boolean'
  },
  bestf: {
    alias: 'b',
    desc: 'Use Wunderground Best Forecast',
    default: true,
    type: 'boolean'
  },
  save: {
    alias: 's',
    desc: 'Save flags to config file',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var dproceed = false;
  var mproceed = false;
  var dreset = false;
  var mreset = false;
  var dstamp = new Date(config.wunder.date.dstamp);
  var mstamp = new Date(config.wunder.date.mstamp);
  var day = moment(new Date()).diff(dstamp, 'hours');
  var hour = moment(new Date()).diff(mstamp, 'minutes');
  var minute = moment(new Date()).diff(mstamp, 'seconds');
  var checkStamp = tools.limitWunder(config);
  config = checkStamp[0];
  dproceed = checkStamp[1];
  mproceed = checkStamp[2];
  dreset = checkStamp[3];
  mreset = checkStamp[4];
  if (dproceed && mproceed) {
    (function () {
      var features = argv.e.split(',').join('/');
      var userConfig = {
        bestf: argv.b,
        features: features.split('/'),
        lang: argv.l,
        pws: argv.p
      };
      if (config.merge) config = _.merge({}, config, userConfig);
      if (argv.s && config.merge) noon.save(CFILE, config);
      if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
      var theme = themes.loadTheme(config.theme);
      if (config.verbose) themes.label(theme, 'down', 'Wunderground');
      var scont = [];
      scont.push('lang:' + config.wunder.lang.toUpperCase());
      config.wunder.pws ? scont.push('pws:1') : scont.push('pws:0');
      config.wunder.bestf ? scont.push('bestfct:1') : scont.push('bestfct:0');
      var query = argv.query;
      var apikey = process.env.WUNDERGROUND;
      var url = encodeURI('https://api.wunderground.com/api/' + apikey + '/' + features + '/' + scont.join('/') + '/q/' + query + '.json');
      console.log(url);
      var tofile = {
        type: 'wunderground',
        source: 'https://www.wunderground.com/?apiref=f6e0dc6b44f8fee2'
      };
      http({ url: url }, function (error, response) {
        if (!error && response.statusCode === 200) {
          var body = JSON.parse(response.body);
          if (body.response.error) throw new Error(body.response.error.description);
          tofile.body = body;
          if (argv.o) tools.outFile(argv.o, argv.f, tofile);
          if (config.usage) {
            dreset ? console.log('Timestamp expired, reset usage limits.\n' + config.wunder.date.dremain + '/' + config.wunder.date.dlimit + ' requests remaining today.') : console.log(config.wunder.date.dremain + '/' + config.wunder.date.dlimit + ' requests remaining today, will reset in ' + (24 - day) + ' hours, ' + (60 - hour) + ' minutes, ' + (60 - minute) + ' seconds.');
            mreset ? console.log('Timestamp expired, reset usage limits.\n' + config.wunder.date.mremain + '/' + config.wunder.date.mlimit + ' requests remaining this minute.') : console.log(config.wunder.date.mremain + '/' + config.wunder.date.mlimit + ' requests remaining today, will reset in ' + (60 - minute) + ' seconds.');
          }
        } else {
          throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
        }
      });
    })();
  } else if (!dproceed) {
    throw new Error('Reached month\'s usage limit of ' + config.wunder.date.dlimit + '.');
  } else if (!mproceed) console.log('Reached usage limit of ' + config.wunder.date.mlimit + ', please wait a minute.');
};