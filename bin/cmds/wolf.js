'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'wolf <command>';
exports.desc = 'Wolfram Alpha functions';
exports.builder = function (yargs) {
  return yargs.commandDir('wolfram-alpha');
};
exports.handler = function (argv) {};