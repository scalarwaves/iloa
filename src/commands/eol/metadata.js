/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'metadata <id>'
exports.aliases = ['meta', 'md']
exports.desc = 'Returns metadata for given data object'
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
  taxonomy: {
    alias: 'x',
    desc: tools.wrapStr("return any taxonomy details from different taxon hierarchy providers, in an array named 'taxonConcepts'", true, true),
    default: true,
    type: 'boolean'
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
    cachettl: argv.c,
    language: argv.g,
    taxonomy: argv.x
  }
  if (config.merge) config = tools.merge(config, userConfig)
  if (argv.s && config.merge) noon.save(CFILE, config)
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Encyclopedia of Life')
  const prefix = `http://eol.org/api/data_objects/1.0/${argv.id}.json`
  const ucont = []
  ucont.push(`taxonomy=${argv.x}`)
  ucont.push(`language=${argv.g}`)
  ucont.push(`cachettl=${argv.c}`)
  ucont.push(`key=${process.env.EOLKEY}`)
  const url = `${prefix}?${ucont.join('&')}`
  const tofile = {
    type: 'metadata',
    source: 'http://eol.org'
  }
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      tofile.metadata = {}
      themes.label(theme, 'right', 'ID', body.identifier)
      tofile.metadata.id = body.identifier
      themes.label(theme, 'right', 'Scientific Name', body.scientificName)
      tofile.metadata.scientificName = body.scientificName
      themes.label(theme, 'right', 'Richness Score', body.richness_score)
      tofile.metadata.richness_score = body.richness_score
      if (body.taxonConcepts) {
        tofile.taxonConcepts = {}
        themes.label(theme, 'right', 'Taxon Concepts')
        for (let i = 0; i <= body.taxonConcepts.length - 1; i++) {
          const item = body.taxonConcepts[i]
          themes.label(theme, 'right', 'ID', item.identifier)
          themes.label(theme, 'right', 'Scientific Name', item.scientificName)
          themes.label(theme, 'right', 'According to', item.nameAccordingTo)
          themes.label(theme, 'right', 'Canonical', item.canonicalForm)
          themes.label(theme, 'right', 'Source ID', item.sourceIdentifier)
          themes.label(theme, 'right', 'Taxon Rank', item.taxonRank)
          tofile.taxonConcepts[[`id${i}`]] = item.identifier
          tofile.taxonConcepts[[`scientificName${i}`]] = item.scientificName
          tofile.taxonConcepts[[`accordingTo${i}`]] = item.nameAccordingTo
          tofile.taxonConcepts[[`canonical${i}`]] = item.canonicalForm
          tofile.taxonConcepts[[`sourceIdentifier${i}`]] = item.sourceIdentifier
          tofile.taxonConcepts[[`taxonRank${i}`]] = item.taxonRank
        }
      }
      if (body.dataObjects) {
        tofile.dataObjects = {}
        themes.label(theme, 'right', 'Data Objects')
        for (let i = 0; i <= body.dataObjects.length - 1; i++) {
          const item = body.dataObjects[i]
          themes.label(theme, 'right', 'id', item.identifier)
          tofile.dataObjects[[`id${i}`]] = item.identifier
          themes.label(theme, 'right', 'dataType', item.dataType)
          tofile.dataObjects[[`dataType${i}`]] = item.dataType
          if (item.dataSubtype !== '') {
            themes.label(theme, 'right', 'Data Subtype', item.dataSubtype)
            tofile.dataObjects[[`dataSubtype${i}`]] = item.dataSubtype
          }
          themes.label(theme, 'right', 'vettedStatus', item.vettedStatus)
          tofile.dataObjects[[`vettedStatus${i}`]] = item.vettedStatus
          themes.label(theme, 'right', 'dataRating', item.dataRating)
          tofile.dataObjects[[`dataRating${i}`]] = item.dataRating
          themes.label(theme, 'right', 'subject', item.subject)
          tofile.dataObjects[[`subject${i}`]] = item.subject
          themes.label(theme, 'right', 'mimeType', item.mimeType)
          const dtprefix = 'http://purl.org/dc/dcmitype/'
          tofile.dataObjects[[`mimeType${i}`]] = item.mimeType
          if (item.dataType === `${dtprefix}StillImage` || item.dataType === `${dtprefix}MovingImage` || item.dataType === `${dtprefix}Sound`) {
            themes.label(theme, 'right', 'Title', item.title)
            tofile.dataObjects[[`title${i}`]] = item.title
            themes.label(theme, 'right', 'URL', item.mediaURL)
            tofile.dataObjects[[`mediaURL${i}`]] = item.mediaURL
            if (item.location) {
              themes.label(theme, 'right', 'Location', item.location)
              tofile.dataObjects[[`location${i}`]] = item.location
            }
            themes.label(theme, 'right', 'EOL URL', item.eolMediaURL)
            tofile.dataObjects[[`eolMediaURL${i}`]] = item.eolMediaURL
          }
          themes.label(theme, 'right', 'created', item.created)
          tofile.dataObjects[[`created${i}`]] = item.created
          themes.label(theme, 'right', 'modified', item.modified)
          tofile.dataObjects[[`modified${i}`]] = item.modified
          themes.label(theme, 'right', 'language', item.language)
          tofile.dataObjects[[`language${i}`]] = item.language
          themes.label(theme, 'right', 'license', item.license)
          tofile.dataObjects[[`license${i}`]] = item.license
          themes.label(theme, 'right', 'rightsHolder', item.rightsHolder)
          tofile.dataObjects[[`rightsHolder${i}`]] = item.rightsHolder
          themes.label(theme, 'right', 'source', item.source)
          tofile.dataObjects[[`source${i}`]] = item.source
          themes.label(theme, 'right', 'description', tools.wrapStr(item.description.trim(), true, true))
          tofile.dataObjects[[`description${i}`]] = item.description
          tofile.dataObjects[[`agent${i}`]] = {}
          themes.label(theme, 'right', 'Agents')
          for (let j = 0; j <= item.agents.length - 1; j++) {
            const subitem = item.agents[j]
            themes.label(theme, 'right', 'full_name', subitem.full_name)
            themes.label(theme, 'right', 'homepage', subitem.homepage)
            themes.label(theme, 'right', 'role', subitem.role)
            tofile.dataObjects[[`agent${i}`]][[`full_name${j}`]] = subitem.full_name
            tofile.dataObjects[[`agent${i}`]][[`homepage${j}`]] = subitem.homepage
            tofile.dataObjects[[`agent${i}`]][[`role${j}`]] = subitem.role
          }
        }
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    } else {
      throw new Error(error)
    }
  })
}
