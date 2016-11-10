'use strict';

var themes = require('../../themes');
var tools = require('../../tools');

var _ = require('lodash');
var noon = require('noon');

var CFILE = process.env.HOME + '/.iloa.noon';
var config = noon.load(CFILE);
var theme = themes.loadTheme(config.theme);

/*
 * The main subpod handler
 * @param pn {number} The pod number
 * @param subpods {array} List of objects to process
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
function subPod(pn, subpod, tofile) {
  var tf = tofile;
  for (var i = 0; i <= subpod.length - 1; i++) {
    var sp = subpod[i];
    var meta = sp.$;
    tf[['pod' + pn]][['subpod' + i]] = {};
    themes.label(theme, 'right', 'Subpod ' + i);
    if (meta.title !== '') {
      themes.label(theme, 'right', 'Title', meta.title);
      tf[['pod' + pn]][['subpod' + i]].title = meta.title;
    }
    themes.label(theme, 'right', 'Text', tools.wrapStr(tools.arrToStr(sp.plaintext)));
    tf[['pod' + pn]][['subpod' + i]].text = tools.arrToStr(sp.plaintext);
    themes.label(theme, 'right', 'Image', sp.img[0].$.src);
    tf[['pod' + pn]][['subpod' + i]].image = sp.img[0].$.src;
  }
  return tf;
}

/*
 * The main pod handler
 * Calls: subPod()
 *
 * @param pods {object} List of pods to process
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
function handlePods(pods, tofile) {
  var tf = tofile;
  for (var i = 0; i <= pods.length - 1; i++) {
    var p = pods[i];
    var meta = p.$;
    tf[['pod' + i]] = {};
    themes.label(theme, 'right', 'Pod ' + i);
    if (meta.title !== '') {
      themes.label(theme, 'right', 'Title', meta.title);
      tf[['pod' + i]].title = meta.title;
    }
    if (meta.scanner !== undefined) {
      themes.label(theme, 'right', 'Scanner', meta.scanner);
      tf[['pod' + i]].scanner = meta.scanner;
    }
    if (meta.numsubpods !== undefined) {
      themes.label(theme, 'right', 'Subpods', parseInt(meta.numsubpods, 10));
      tf[['pod' + i]].subpods = parseInt(meta.numsubpods, 10);
    }
    if (meta.position !== undefined) {
      themes.label(theme, 'right', 'Position', parseInt(meta.position, 10));
      tf[['pod' + i]].position = parseInt(meta.position, 10);
    }
    tf = subPod(i, p.subpod, tf);
  }
  return tf;
}

/*
 * Pod error handler.
 * Calls: handlePods()
 *
 * @param pods {object} The pods to process
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
exports.numPods = function (pods, tofile) {
  var tf = tofile;
  if (!pods.error) {
    tf = handlePods(pods, tf);
  } else {
    console.log('Pod error: ' + pods.error);
  }
  return tf;
};

/*
 * Handle Wolfram|Alpha's assumptions about your query.
 *
 * @param assumptions {object} A list of assumptions to process
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
exports.assume = function (assumptions, tofile) {
  var tf = tofile;
  var assume = assumptions[0].assumption;
  themes.label(theme, 'right', 'Assumptions');

  var _loop = function _loop(i) {
    tf[['assumption' + i]] = {};
    var meta = assume[i].$;
    var v = assume[i].value;
    tf[['assumption' + i]].type = meta.type;
    if (meta.type === 'Clash') {
      themes.label(theme, 'down', meta.type);
      var one = v[0].$.desc;
      var two = v[1].$.desc;
      tf[['assumption' + i]].clash = 'Assuming ' + meta.word + ' is ' + one + '. Use ' + two + ' instead.';
      console.log('Assuming ' + meta.word + ' is ' + one + '. Use ' + two + ' instead.');
    }
    if (meta.type === 'FormulaSolve') {
      themes.label(theme, 'right', meta.type);
      _.each(v, function (val) {
        themes.label(theme, 'right', val.$.desc, val.$.input);
        tf[['assumption' + i]][['' + val.$.desc]] = val.$.input;
      });
    }
    if (meta.type === 'FormulaSelect') {
      themes.label(theme, 'down', meta.type);
      var _one = v[0].$.desc;
      var _two = v[1].$.desc;
      tf[['assumption' + i]].formulaSelect = 'Assuming ' + _one + '. Use ' + _two + ' instead.';
      console.log('Assuming ' + _one + '. Use ' + _two + ' instead.');
    }
    if (meta.type === 'FormulaVariable') {
      themes.label(theme, 'down', meta.type);
      console.log(meta.desc + ': ' + v[0].$.desc);
      tf[['assumption' + i]][['' + meta.desc]] = v[0].$.desc;
    }
    if (meta.type === 'FormulaVariableOption') {
      themes.label(theme, 'down', meta.type);
      var _one2 = v[0].$.desc;
      var _two2 = v[1].$.desc;
      tf[['assumption' + i]].formulaVariableOption = 'Assuming ' + _one2 + '. Use ' + _two2 + ' instead.';
      console.log('Assuming ' + _one2 + '. Use ' + _two2 + ' instead.');
    }
    if (meta.type === 'FormulaVariableInclude') {
      themes.label(theme, 'down', meta.type);
      var _one3 = v[0].$.desc;
      tf[['assumption' + i]].formulaVariableInclude = _one3;
      console.log('Assuming ' + _one3 + '.');
    }
  };

  for (var i = 0; i <= assume.length - 1; i++) {
    _loop(i);
  }
  return tf;
};