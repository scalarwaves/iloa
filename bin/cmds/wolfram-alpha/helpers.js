'use strict';

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _themes = require('../../themes');

var _themes2 = _interopRequireDefault(_themes);

var _tools = require('../../tools');

var _tools2 = _interopRequireDefault(_tools);

var _noon = require('noon');

var _noon2 = _interopRequireDefault(_noon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CFILE = process.env.HOME + '/.iloa.noon';
var config = _noon2.default.load(CFILE);
var theme = _themes2.default.loadTheme(config.theme);

/*
 * The main subpod handler
 * @param subpods {array} List of objects to process
 */
function subPod(subpods) {
  for (var i = 0; i <= subpods.length - 1; i++) {
    var sp = subpods[i];
    _themes2.default.label(theme, 'right', 'Subpod ' + i);
    _themes2.default.label(theme, 'right', 'Title', sp.title);
    _themes2.default.label(theme, 'right', 'Text', _tools2.default.wrapStr(_tools2.default.arrToStr(sp.plaintext)));
    _themes2.default.label(theme, 'right', 'Image', sp.img.src);
  }
}

/*
 * Single/Multiple subpod switch.
 * Calls: subPod()
 *
 * @param pods {array} List of pod objects
 * @param subpods {array} List of subpods
 */
function numSubPods(pods, subpods) {
  if (pods.numsubpods > 1) {
    subPod(subpods);
  } else {
    _themes2.default.label(theme, 'right', 'Subpod ' + pods.$.numsubpods);
    if (subpods.$.title !== '') _themes2.default.label(theme, 'right', 'Title', subpods.$.title);
    _themes2.default.label(theme, 'right', 'Text', _tools2.default.wrapStr(_tools2.default.arrToStr(subpods.plaintext)));
    _themes2.default.label(theme, 'right', 'Image', subpods.img[0].$.src);
  }
}

/*
 * The main pod handler
 * Calls: numSubPods()
 *
 * @param pods {object} List of pods to process
 */
function handlePods(pods) {
  for (var i = 0; i <= pods.length - 1; i++) {
    var p = pods[i];
    _themes2.default.label(theme, 'right', 'Pod ' + i);
    if (p.$.title !== '') _themes2.default.label(theme, 'right', 'Title', p.$.title);
    if (p.scanner !== undefined) _themes2.default.label(theme, 'right', 'Scanner', p.$.scanner);
    if (p.numsubpods !== undefined) _themes2.default.label(theme, 'right', 'Subpods', p.$.numsubpods);
    if (p.position !== undefined) _themes2.default.label(theme, 'right', 'Position', p.$.position);
    numSubPods(p, p.subpod[0]);
  }
}

/*
 * Single/Multi pod switch.
 * Calls: handlePods() and numSubPods()
 *
 * @param pod {object} The pod to process
 */
exports.numPods = function (pods) {
  if (pods.length > 1) {
    handlePods(pods);
  } else {
    if (!pods.error) {
      _themes2.default.label(theme, 'right', 'Pod ' + pods.length);
      _themes2.default.label(theme, 'right', 'Title', pods.title);
      _themes2.default.label(theme, 'right', 'Text', _tools2.default.wrapStr(_tools2.default.arrToStr(pods.plaintext)));
      _themes2.default.label(theme, 'right', 'Scanner', pods.scanner);
      _themes2.default.label(theme, 'right', 'Subpods', pods.numsubpods);
      _themes2.default.label(theme, 'right', 'Position', pods.position);
      numSubPods(pods, pods.subpod);
    } else {
      console.log('Pod error: ' + pods.error);
    }
  }
};

/*
 * Handle Wolfram|Alpha's assumptions about your query.
 *
 * @param assumptions {object} A list of assumptions to process
 */
exports.assume = function (assumptions) {
  var assume = assumptions[0].assumption;
  _themes2.default.label(theme, 'right', 'Assumptions');
  for (var i = 0; i <= assume.length - 1; i++) {
    var meta = assume[i].$;
    var v = assume[i].value;
    if (meta.type === 'Clash') {
      _themes2.default.label(theme, 'down', meta.type);
      var one = v[0].$.desc;
      var two = v[1].$.desc;
      console.log('Assuming ' + meta.word + ' is ' + one + '. Use ' + two + ' instead.');
    }
    if (meta.type === 'FormulaSolve') {
      _themes2.default.label(theme, 'right', meta.type);
      (0, _each3.default)(v, function (val) {
        _themes2.default.label(theme, 'right', val.$.desc, val.$.input);
      });
    }
    if (meta.type === 'FormulaSelect') {
      _themes2.default.label(theme, 'down', meta.type);
      var _one = v[0].$.desc;
      var _two = v[1].$.desc;
      console.log('Assuming ' + _one + '. Use ' + _two + ' instead.');
    }
    if (meta.type === 'FormulaVariable') {
      _themes2.default.label(theme, 'down', meta.type);
      console.log(meta.desc + ': ' + v[0].$.desc);
    }
    if (meta.type === 'FormulaVariableOption') {
      _themes2.default.label(theme, 'down', meta.type);
      var _one2 = v[0].$.desc;
      var _two2 = v[1].$.desc;
      console.log('Assuming ' + _one2 + '. Use ' + _two2 + ' instead.');
    }
    if (meta.type === 'FormulaVariableInclude') {
      _themes2.default.label(theme, 'down', meta.type);
      var _one3 = v[0].$.desc;
      console.log('Assuming ' + _one3 + '.');
    }
  }
};