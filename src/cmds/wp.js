/* eslint max-len:0 */
const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const gg = require('good-guy-http')
const noon = require('noon')
const http = gg({
  cache: false,
  defaultCache: {
    cached: false,
  },
})

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'wikipedia <query>'
exports.aliases = ['wiki', 'wp']
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
  intro: {
    alias: 'i',
    desc: 'Just intro or all sections',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    wiki: {
      intro: argv.i,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  if (argv.s && config.merge) noon.save(CFILE, config)
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Wikipedia')
  const wcont = []
  wcont.push(argv.query)
  if (argv._.length > 1) {
    _.each(argv._, (value) => {
      if (value !== 'wp') wcont.push(value)
    })
  }
  let words = ''
  if (wcont.length > 1) {
    words = wcont.join('+')
  } else {
    words = wcont[0]
  }
  let prefix = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&indexpageids&redirects=1&continue=&explaintext='
  if (argv.i) prefix = `${prefix}&exintro=`
  let url = `${prefix}&titles=${words}`
  url = encodeURI(url)
  const tofile = {
    type: 'wiki',
    source: 'http://www.wikipedia.org/',
    url,
  }
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      if (body.query.pageids[0] === '-1') {
        if (body.query.normalized) {
          const fixed = body.query.normalized[0]
          console.log(`Query normalized from ${fixed.from} to ${fixed.to}, try searching again.`)
          process.exit(0)
        } else {
          console.log(`No Wikipedia article found for ${wcont.join(' ')}, try searching again.`)
          process.exit(0)
        }
      }
      const pageID = body.query.pageids[0]
      const page = body.query.pages[pageID]
      const plain = page.extract.trim()
      const wrapped = tools.wrapStr(plain, true, true)
      themes.label(theme, 'down', 'Summary', wrapped)
      tofile.summary = plain
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    } else {
      throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
    }
  })
}
