'use strict';

var _map2 = require('lodash/map');

var _map3 = _interopRequireDefault(_map2);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _themes = require('../themes');

var _themes2 = _interopRequireDefault(_themes);

var _tools = require('../tools');

var _tools2 = _interopRequireDefault(_tools);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _noon = require('noon');

var _noon2 = _interopRequireDefault(_noon);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _xRay = require('x-ray');

var _xRay2 = _interopRequireDefault(_xRay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len: 0 */
var CFILE = process.env.HOME + '/.iloa.noon';

var general = ['ai', 'wp', 'bi', 'cc', 'ddd', 'ew', 'wd', 'ddg', 'gb', 'go', 'qw', 're', 'sp', 'iq', 'sw', 'yh', 'yn', 'dc', 'tl'];
var files = ['dbt', 'fd', 'gpa', 'nt', 'or', 'tpb', 'tt'];
var images = ['bii', 'da', 'px', '1x', 'fl', 'frk', 'goi', 'nt', 'qwi', 're', 'sw'];
var it = ['al', 'bb', 'gl', 'gh', 'gt', 'habr', 'ho', 'st', 'scd', 'scc'];
var map = ['osm', 'ph'];
var music = ['dz', 'dbt', 'gps', 'mc', 'nt', 'tpb', 'sc', 'tt', 'yt'];
var news = ['bin', 'dg', 'gon', 'qwn', 're', 'yhn'];
var science = ['bs', 'cr', 'gos', 'ma', 'scs', 'wa'];
var socialMedia = ['dg', 'qws', 're', 'tw'];
var videos = ['dbt', 'gpm', 'in', 'nt', 'tpb', 'ss', 'tt', 'yt', 'dm', 'vm'];

exports.command = 'searx <query>';
exports.desc = 'Metasearch searx.me';
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
  cat: {
    alias: 'c',
    desc: 'comma-separated: general,files,images,it,map,music,news,science,social+media,videos',
    default: '',
    type: 'string'
  },
  engine: {
    alias: 'e',
    desc: 'comma-separated engines',
    default: '',
    type: 'string'
  }
};
exports.handler = function (argv) {
  _tools2.default.checkConfig(CFILE);
  var config = _noon2.default.load(CFILE);
  var theme = _themes2.default.loadTheme(config.theme);
  if (config.verbose) _themes2.default.label(theme, 'down', 'searx');
  var prefix = 'https://searx.me/?q=';
  var scont = [];
  scont.push(argv.query);
  if (argv._.length > 1) {
    (0, _each3.default)(argv._, function (value) {
      if (value !== 'searx') scont.push(value);
    });
  }
  var words = '';
  if (scont.length > 1) {
    words = scont.join('+');
  } else {
    words = scont[0];
  }
  var ccont = argv.cat.split(',');
  var cassy = [];
  if (ccont.length > 1) {
    (0, _each3.default)(ccont, function (value) {
      cassy.push('&category_' + value + '=on');
    });
  } else if (ccont.length === 1) {
    cassy.push('&category_' + ccont[0] + '=on');
  } else cassy.push('&category_none=1');
  var econt = argv.engine.split(',');
  var eassy = [];
  if (econt.length > 1) {
    (0, _each3.default)(econt, function (value) {
      if (ccont.general !== undefined) if (general[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.files !== undefined) if (files[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.images !== undefined) if (images[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.it !== undefined) if (it[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.general !== undefined) if (general[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.map !== undefined) if (map[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.music !== undefined) if (music[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.news !== undefined) if (news[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.science !== undefined) if (science[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.socialmedia !== undefined) if (socialMedia[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
      if (ccont.videos !== undefined) if (videos[value] !== undefined && eassy[value] !== undefined) eassy.push('%21' + value + '+');
    });
  } else eassy.push('%21' + econt[0]);
  var url = '' + prefix + eassy.join('') + words + cassy.join('');
  var tofile = {
    type: 'searx',
    source: 'https://searx.me/',
    url: url
  };
  var spinner = (0, _ora2.default)({
    text: '' + _chalk2.default.bold.cyan('Loading results...'),
    spinner: 'dots8',
    color: 'yellow'
  });
  spinner.start();
  var x = (0, _xRay2.default)();
  x(url, {
    h: 'body@html',
    r: ['.result', '.result-default', '.result-content']
  })(function (err, body) {
    spinner.stop();
    spinner.clear();
    var icont = [];
    (0, _map3.default)(body.r, function (value) {
      return icont.push(value.trim().replace(/cached/, '').replace(/ {2,}/mig, '').replace(/\n{2,}/mig, '\n'));
    });
    var links = body.h.match(/(<a(?:(?!\/a>).|\n)*(?=>).)(.+)(<\/a>)/mig);
    var lcont = [];
    (0, _each3.default)(links, function (value) {
      return lcont.push(value.replace(/<a href="/mig, '').replace(/".*<\/a>/, ''));
    });
    lcont.pop();lcont.shift();lcont.shift();lcont.shift();lcont.shift();
    var nlink = [];
    (0, _map3.default)(lcont, function (value) {
      if (!/https:\/\/web\.archive\.org\/web/mig.test(value) && !/https?:\/\/[a-z0-9\.\/]*\[\.\.\.\][a-z0-9_\-\.\/\?=]*/mig.test(value)) nlink.push(value);
    });
    var tcont = [];
    (0, _map3.default)(icont, function (value) {
      return tcont.push(value.replace(/[…a-z0-9\-_\.\s]*https?:\/\/[a-z0-9\.\/\[\]_\?\-#]*$/mig, '\n'));
    });
    (0, _map3.default)(tcont, function (value) {
      value.replace(/&lt;/, '<');
      value.replace(/&gt;/, '>');
    });
    _themes2.default.label(theme, 'down', 'searx', decodeURI('!' + ccont.join(' !') + ' !' + econt.join(' !') + ' ' + scont.join(' ')));
    for (var y = 0; y <= tcont.length - 1; y++) {
      console.log(tcont[y] + '\n' + _chalk2.default.underline(nlink[y]) + '\n\n');
      tofile[['text' + y]] = tcont[y];
      tofile[['link' + y]] = nlink[y];
    }
    if (argv.o) _tools2.default.outFile(argv.o, argv.f, tofile);
  });
};