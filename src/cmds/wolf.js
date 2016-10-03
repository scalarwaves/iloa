/* eslint no-unused-vars: 0 */
exports.command = 'wolf <command>'
exports.desc = 'Wolfram Alpha functions'
exports.builder = (yargs) => yargs.commandDir('wolfram-alpha')
exports.handler = (argv) => {}
