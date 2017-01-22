/* eslint no-unused-vars: 0 */
exports.command = 'configuration <command>'
exports.aliases = ['config', 'conf']
exports.desc = 'Configuration tasks'
exports.builder = (yargs) => yargs.commandDir('configuration')
exports.handler = (argv) => {}
