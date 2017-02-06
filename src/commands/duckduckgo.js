/* eslint max-len:0 */
const helper = require('./helpers/duckduckgo-helper')
const themes = require('../themes')
const tools = require('../tools')

const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'duckduckgo <query>'
exports.aliases = ['duck', 'dg']
exports.desc = 'DuckDuckGo Instant Answers'
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string'
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean'
  },
  save: {
    alias: 's',
    desc: 'Save options to config file',
    default: false,
    type: 'boolean'
  }
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'DuckDuckGo')
  const dcont = []
  dcont.push(argv.query)
  if (argv._.length > 1) {
    for (let i = 0; i <= argv._.length - 1; i++) {
      if (argv._[i] !== 'duckduckgo' && argv._[i] !== 'duck' && argv._[i] !== 'dg') dcont.push(argv._[i])
    }
  }
  let words = ''
  if (dcont.length > 1) {
    words = dcont.join('+')
  } else {
    words = dcont[0]
  }
  let url = `https://api.duckduckgo.com/?q=${words}&format=json&pretty=1&no_redirect=1&no_html=1&t=iloa`
  url = encodeURI(url)
  let tofile = {
    type: 'duckduckgo',
    source: 'https://www.duckduckgo.com/',
    url
  }
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const blank = {
        DefinitionSource: '',
        Heading: '',
        ImageWidth: '',
        RelatedTopics: [],
        Entity: '',
        meta: null,
        Type: '',
        Redirect: '',
        DefinitionURL: '',
        AbstractURL: '',
        Definition: '',
        AbstractSource: '',
        Infobox: '',
        Image: '',
        ImageIsLogo: '',
        Abstract: '',
        AbstractText: '',
        AnswerType: '',
        ImageHeight: '',
        Answer: '',
        Results: []
      }
      const metadata = {
        maintainer: {
          github: 'shanmbic'
        },
        perl_module: null,
        status: null,
        production_state: 'offline',
        dev_date: null,
        signal_from: 'objective_c',
        live_date: null,
        src_options: {},
        repo: 'fathead',
        src_id: null,
        developer: [
          {
            name: 'shanmbic',
            url: 'https://github.com/shanmbic',
            type: 'github'
          }
        ],
        tab: 'About',
        producer: 'Jag',
        unsafe: null,
        id: 'objective_c',
        dev_milestone: 'development',
        topic: [
          'Objective-C',
          'programming'
        ],
        name: 'Objective-C',
        attribution: null,
        created_date: '2017-01-29',
        example_query: 'NSObject',
        description: 'Provides instant documentation for Objective-C. Objective-C is a general-purpose, object-oriented programming language used by Apple for the OS X and iOS operating systems.',
        is_stackexchange: null,
        designer: null,
        src_domain: null,
        src_name: null,
        blockgroup: null,
        src_url: 'https://developer.apple.com/reference/objectivec'
      }
      const body = JSON.parse(response.body)
      if (body.Redirect !== '') {
        console.log(`!bang redirect to ${body.Redirect}`)
      } else if (body.Abstract === '' && body.Answer === '' && body.meta !== null) {
        console.log('Only metadata was returned:')
        console.log(JSON.stringify(body.meta, null, 2))
      }
      if (JSON.stringify(body) === JSON.stringify(blank)) {
        console.log('DuckDuckGo found no results.')
      }
      if (JSON.stringify(body) === JSON.stringify(metadata)) {
        console.log('DuckDuckGo returned Objective-C metadata.')
      }
      let rtype = null
      if (body.Type !== '') {
        if (body.Type === 'A') rtype = 'Article'
        if (body.Type === 'C') rtype = 'Category'
        if (body.Type === 'D') rtype = 'Disambiguation'
        if (body.Type === 'N') rtype = 'Name'
      } else rtype = body.Type
      tofile.answerType = body.AnswerType
      if (body.AnswerType === 'phone' || body.AnswerType === 'calc' || body.AnswerType === 'unicode' || body.AnswerType === 'unicode_conversion') tofile = helper.Raw(body, tofile)
      if (rtype !== '') themes.label(theme, 'right', 'Type', rtype)
      tofile.responseType = rtype
      if (rtype === 'Article') tofile = helper.Article(body, tofile)
      if (rtype === 'Category' || rtype === 'Disambiguation') tofile = helper.Abstract(body, tofile)
      if (body.Image) tofile = helper.Image(body, tofile)
      if (body.RelatedTopics !== []) tofile = helper.RelatedTopics(body, tofile)
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    } else {
      throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
    }
  })
}
