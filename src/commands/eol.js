/* eslint-disableno-unused-vars: 0 */
exports.command = 'eol <command>'
exports.aliases = ['life']
exports.desc = 'Encyclopedia of Life taks'
exports.builder = (yargs) => yargs.commandDir('eol')
exports.handler = (argv) => {}
