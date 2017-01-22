/* eslint max-len:0, no-unused-vars:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'info'
exports.aliases = ['i']
exports.desc = 'Print provider hierarchies and service status'
exports.builder = {}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Encyclopedia of Life')
  let url = `http://eol.org/api/ping/1.0.json?key=${process.env.EOLKEY}`
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      body.response.message === 'Success' ? themes.label(theme, 'right', 'Service Status', 'OK') : console.log("Something's not working.")
    } else {
      throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
    }
  })
  url = `http://eol.org/api/provider_hierarchies/1.0.json?${process.env.EOLKEY}`
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      themes.label(theme, 'right', 'Provider Hierarchies')
      for (let i = 0; i <= body.length - 1; i++) {
        const item = body[i]
        themes.label(theme, 'right', 'ID', item.id)
        themes.label(theme, 'right', 'Label', item.label)
      }
    } else {
      throw new Error(error)
    }
  })
}
