'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'eol <command>';
exports.desc = 'Encyclopedia of Life taks';
exports.builder = function (yargs) {
  return yargs.commandDir('eol');
};
exports.handler = function (argv) {};