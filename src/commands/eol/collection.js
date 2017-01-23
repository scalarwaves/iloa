/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'collection <id>'
exports.aliases = ['collect', 'col']
exports.desc = 'Returns entries that match a string query'
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
  },
  page: {
    alias: 'p',
    desc: 'Page number',
    default: 1,
    type: 'number'
  },
  ppage: {
    alias: 'e',
    desc: '0-500',
    default: 50,
    type: 'number'
  },
  filter: {
    alias: 'l',
    desc: 'articles,collections,communities,images,sounds,taxa,users,video',
    default: '',
    type: 'string'
  },
  by: {
    alias: 'b',
    desc: tools.wrapStr('recently_added,oldest,alphabetical,reverse_alphabetical,richness,rating,sort_field,reverse_sort_field', true, true),
    default: 'recently_added',
    type: 'string'
  },
  field: {
    alias: 'i',
    desc: tools.wrapStr('If a sort_field parameter is included, only collection items whose sort field exactly matches the given string will be returned', true, true),
    default: '',
    type: 'string'
  },
  cachettl: {
    alias: 'c',
    desc: 'No. of seconds you wish to have the response cached',
    default: 60,
    type: 'number'
  },
  language: {
    alias: 'g',
    desc: tools.wrapStr('ms, de, en, es, fr, gl, it, nl, nb, oc, pt-BR, sv, tl, mk, sr, uk, ar, zh-Hans, zh-Hant, ko', true, true),
    default: 'en',
    type: 'string'
  }
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    by: argv.b,
    cachettl: argv.c,
    field: argv.i,
    filter: argv.l,
    language: argv.g,
    page: argv.p,
    ppage: argv.e
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  if (argv.s && config.merge) noon.save(CFILE, config)
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Encyclopedia of Life')
  const prefix = `http://eol.org/api/collections/1.0/${argv.id}.json`
  const ucont = []
  ucont.push(`page=${argv.p}`)
  ucont.push(`per_page=${argv.e}`)
  ucont.push(`sort_by=${argv.b}`)
  ucont.push(`filter=${argv.l}`)
  ucont.push(`sort_field=${argv.i}`)
  ucont.push(`cachettl=${argv.c}`)
  ucont.push(`language=${argv.g}`)
  ucont.push(`key=${process.env.EOLKEY}`)
  const url = `${prefix}?${ucont.join('&')}`
  const tofile = {
    type: 'collections',
    source: 'http://eol.org'
  }
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      tofile.collections = {}
      themes.label(theme, 'right', 'Total Items', body.total_items)
      tofile.collections.total_items = body.total_items
      themes.label(theme, 'right', 'Title', body.name)
      tofile.collections.name = body.name
      themes.label(theme, 'right', 'Description', body.description)
      tofile.collections.description = body.description
      themes.label(theme, 'right', 'Logo', body.logo_url)
      tofile.collections.logo_url = body.logo_url
      themes.label(theme, 'right', 'Score', body.richness_score)
      tofile.collections.richness_score = body.richness_score
      for (let i = 0; i <= body.item_types.length - 1; i++) {
        const item = body.item_types[i]
        themes.label(theme, 'right', item.item_type, item.item_count)
        tofile.collections[[`item_type${i}`]] = item.item_type
        tofile.collections[[`item_count${i}`]] = item.item_count
      }
      for (let j = 0; j <= body.collection_items.length - 1; j++) {
        const item = body.collection_items[j]
        themes.label(theme, 'right', 'Name', item.name)
        tofile.collections[[`item_name${j}`]] = item.name
        themes.label(theme, 'right', 'Title', item.title)
        tofile.collections[[`item_title${j}`]] = item.title
        themes.label(theme, 'right', 'Object Type', item.object_type)
        tofile.collections[[`object_type${j}`]] = item.object_type
        themes.label(theme, 'right', 'Object ID', item.object_id)
        tofile.collections[[`object_id${j}`]] = item.object_id
        if (item.object_type === 'Image') {
          themes.label(theme, 'right', 'Rating', item.data_rating)
          tofile.collections[[`data_rating${j}`]] = item.data_rating
          themes.label(theme, 'right', 'GUID', item.object_guid)
          tofile.collections[[`object_guid${j}`]] = item.object_guid
          themes.label(theme, 'right', 'Source', item.source)
          tofile.collections[[`source${j}`]] = item.source
        }
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    } else {
      throw new Error(error)
    }
  })
}
