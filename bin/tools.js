'use strict';/* eslint max-len: 0 */var chalk=require('chalk');var fs=require('fs-extra');var moment=require('moment');var noon=require('noon');var ts=require('term-size');var wrap=require('wrap-ansi');var xml2js=require('xml2js');var CFILE=process.env.HOME+'/.iloa.noon';/**
  * The tools module provides useful repetitive tasks
  * @module Utils
  *//**
    * Wolfram|Alpha's API limit check
    * @param  {Object} config The current config
    * @return {Array} Updated config, proceed boolean, and reset boolean
    */exports.limitWolf=function(config){var c=config;var proceed=false;var reset=false;var stamp=new Date(c.wolf.date.stamp);var days=moment(new Date()).diff(stamp,'days');if(days<31){c.wolf.date.remain--;}else if(days>=31){reset=true;c.wolf.date.stamp=new Date().toJSON();c.wolf.date.remain=c.wolf.date.limit;c.wolf.date.remain--;}c.wolf.date.remain<=0?c.wolf.date.remain=0:proceed=true;noon.save(CFILE,c);return[c,proceed,reset];};/**
  * Wunderground's API limit check
  * @param  {Object} config The current config
  * @return {Array} Updated config, proceed boolean, and reset boolean
  */exports.limitWunder=function(config){var c=config;var dproceed=false;var mproceed=false;var dreset=false;var mreset=false;var dstamp=new Date(c.wunder.date.dstamp);var mstamp=new Date(c.wunder.date.mstamp);var day=moment(new Date()).diff(dstamp,'hours');var minute=moment(new Date()).diff(mstamp,'seconds');if(day<24){c.wunder.date.dremain--;}else if(day>=24){dreset=true;c.wunder.date.dstamp=new Date().toJSON();c.wunder.date.dremain=c.wunder.date.dlimit;c.wunder.date.dremain--;}if(minute<60){c.wunder.date.mremain--;}else if(minute>=60){mreset=true;c.wunder.date.mstamp=new Date().toJSON();c.wunder.date.mremain=c.wunder.date.mlimit;c.wunder.date.mremain--;}c.wunder.date.dremain<=0?c.wunder.date.dremain=0:dproceed=true;c.wunder.date.mremain<=0?c.wunder.date.mremain=0:mproceed=true;noon.save(CFILE,c);return[c,dproceed,mproceed,dreset,mreset];};/**
  * Checks if a file exists
  * @private
  * @param {string} path The filename to check.
  * @return {boolean} fileExists
  */function checkOutfile(path){var fileExists=null;try{fs.statSync(path);fileExists=true;}catch(e){if(e.code==='ENOENT')fileExists=false;}return fileExists;}/**
  * Converts string to boolean
  * @public
  * @param {string} value
  * @return {boolean} v
  */exports.checkBoolean=function(value){var v=value;if(v==='true')v=true;if(v==='false')v=false;return v;};/**
 * Converts a boolean to a 0 or 1
 * @param  {boolean} value A boolean value
 * @return {integer} 0 or 1
 */exports.boolToBin=function(value){var r=null;value?r=1:r=0;return r;};/**
  * Checks if config exists. If not, prints init message and exits with error code.
  * @public
  * @param {string} file Configuration filepath
  */exports.checkConfig=function(file){try{fs.statSync(file);}catch(e){if(e.code==='ENOENT')throw new Error('No config found at '+file+', run: \'iloa config init\'');}return true;};/**
  * Checks if object is a single string in an array
  * @public
  * @param {Object} obj Any object
  * @return {Object} Original object or extracted string
  */exports.arrToStr=function(obj){var fixed=null;Array.isArray(obj)&&obj.length===1&&typeof obj[0]==='string'?fixed=obj[0]:fixed=obj;return fixed;};/**
  * Strips HTML from a string
  * @public
  * @param  {string} string Text with HTML tags
  * @return {string} Plain text string
  */exports.stripHTML=function(string){return string.replace(/(<([^>]+)>)/ig,'');};/**
  * Wraps blocks of text
  * @param  {string} str Long string
  * @param  {boolean} hard true, soft false
  * @param  {boolean} wwrap true, column wrap false
  * @return {string} ANSI-wrapped string
  */exports.wrapStr=function(str,hard,wwrap){var termsize=ts();return wrap(str,termsize.columns,hard,wwrap);};/**
  * Handles data export to file. Supports cson, json, noon, plist, xml, yaml.
  * @public
  * @param {string} path The desired filepath and extension
  * @param {boolean} force Whether to force overwrite
  * @param {Object} tofile A numbered object of data points
  */exports.outFile=function(path,force,tofile){var match=path.match(/\.([a-z]*)$/i);var ext=match[1];var builder=new xml2js.Builder();if(ext==='xml'){if(checkOutfile(path)){if(force){var xml=builder.buildObject(tofile);var fd=fs.openSync(path,'w+');fs.writeSync(fd,xml);fs.closeSync(fd);console.log(chalk.white('Overwrote '+path+' with data.'));}else console.log(chalk.white(path+' exists, use -f to force overwrite.'));}else{var _xml=builder.buildObject(tofile);var _fd=fs.openSync(path,'w+');fs.writeSync(_fd,_xml);fs.closeSync(_fd);console.log(chalk.white('Wrote data to '+path+'.'));}}else if(ext==='cson'||ext==='json'||ext==='noon'||ext==='plist'||ext==='yml'||ext==='yaml'){if(checkOutfile(path)){if(force){noon.save(path,tofile);console.log(chalk.white('Overwrote '+path+' with data.'));}else console.log(chalk.white(path+' exists, use -f to force overwrite.'));}else{noon.save(path,tofile);console.log(chalk.white('Wrote data to '+path+'.'));}}else if(ext!=='xml'||ext!=='cson'||ext!=='json'||ext!=='noon'||ext!=='plist'||ext!=='yml'||ext!=='yaml')throw new Error('Format '+ext+' not supported.');};