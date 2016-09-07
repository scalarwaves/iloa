/* eslint max-len:0 */
const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'wiki <query>'
exports.desc = 'Wikipedia summaries'
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string',
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Wikipedia')
  const wcont = []
  wcont.push(argv.query)
  if (argv._.length > 1) {
    _.each(argv._, (value) => {
      if (value !== 'wiki') wcont.push(value)
    })
  }
  let words = ''
  if (wcont.length > 1) {
    words = wcont.join('+')
  } else {
    words = wcont[0]
  }
  let url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&indexpageids&redirects=1&explaintext=&titles=${words}`
  url = encodeURI(url)
  const tofile = {
    type: 'wiki',
    source: 'http://www.wikipedia.org/',
    url,
  }
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      const pageID = body.query.pageids[0]
      const page = body.query.pages[pageID]
      themes.label(theme, 'down', 'Summary', page.extract.trim())
      tofile['summary'] = page.extract.trim()
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    } else {
      throw new Error(`HTTP ${response.statusCode}: ${error}`)
    }
  })
}
