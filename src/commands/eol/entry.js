/* eslint-disablemax-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'entry <id>'
exports.aliases = ['en']
exports.desc = 'Returns data for a single hierarchy and its internal relationships'
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
  common: {
    alias: 'm',
    desc: "All common names for the page's taxon",
    default: false,
    type: 'boolean'
  },
  synonym: {
    alias: 'y',
    desc: "All synonyms for the page's taxon",
    default: false,
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
    common: argv.m,
    synonym: argv.y,
    cachettl: argv.c,
    language: argv.g
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  if (argv.s && config.merge) noon.save(CFILE, config)
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Encyclopedia of Life')
  const prefix = `http://eol.org/api/hierarchy_entries/1.0/${argv.id}.json`
  const ucont = []
  ucont.push(`common_names=${argv.m}`)
  ucont.push(`synonyms=${argv.y}`)
  ucont.push(`cachettl=${argv.c}`)
  ucont.push(`language=${argv.g}`)
  ucont.push(`key=${process.env.EOLKEY}`)
  const url = `${prefix}?${ucont.join('&')}`
  const tofile = {
    type: 'entry',
    src: 'http://eol.org/'
  }
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      themes.label(theme, 'right', 'Source ID', body.sourceIdentifier)
      tofile.sourceIdentifier = body.sourceIdentifier
      themes.label(theme, 'right', 'Taxon ID', body.taxonID)
      tofile.taxonID = body.taxonID
      themes.label(theme, 'right', 'Parent Name Usage ID', body.parentNameUsageID)
      tofile.parentNameUsageID = body.parentNameUsageID
      themes.label(theme, 'right', 'Scientific Name', body.scientificName)
      tofile.scientificName = body.scientificName
      themes.label(theme, 'right', 'Taxon Rank', body.taxonRank)
      tofile.taxonRank = body.taxonRank
      themes.label(theme, 'right', 'Source', body.source)
      tofile.source = body.source
      themes.label(theme, 'right', 'Name According To', tools.arrToStr(body.nameAccordingTo))
      tofile.nameAccordingTo = body.nameAccordingTo
      if (body.vernacularNames) {
        const vern = body.vernacularNames
        tofile.vernacular = {}
        for (let i = 0; i <= vern.length - 1; i++) {
          const item = vern[i]
          if (item.language === argv.g) {
            if (item.eol_preferred) {
              themes.label(theme, 'right', 'Vernacular Name', `${item.vernacularName} -> *preferred*`)
              tofile.vernacular[[`preferredName${i}`]] = item.vernacularName
            } else {
              themes.label(theme, 'right', 'Vernacular', item.vernacularName)
              tofile.vernacular[[`name${i}`]] = item.vernacularName
            }
          }
        }
      }
      if (body.synonyms !== []) {
        tofile.synonyms = {}
        themes.label(theme, 'right', 'Synonyms')
        for (let i = 0; i <= body.synonyms.length - 1; i++) {
          const item = body.synonyms[i]
          themes.label(theme, 'right', 'Synonym', item.synonym)
          themes.label(theme, 'right', 'Relationship', item.relationship)
          tofile.synonyms[[`synonym${i}`]] = item.synonym
          tofile.synonyms[[`relatioship${i}`]] = item.relationship
          if (item.resource !== '') {
            themes.label(theme, 'right', 'Resource', item.resource)
            tofile.synonyms[[`resource${i}`]] = item.resource
          }
        }
      }
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
      if (body.ancestors !== []) {
        tofile.ancestors = {}
        themes.label(theme, 'right', 'Ancestors')
        for (let i = 0; i <= body.ancestors.length - 1; i++) {
          const item = body.ancestors[i]
          themes.label(theme, 'right', 'Source ID', item.sourceIdentifier)
          tofile.ancestors[[`sourceIdentifier${i}`]] = item.sourceIdentifier
          themes.label(theme, 'right', 'Taxon ID', item.taxonID)
          tofile.ancestors[[`taxonID${i}`]] = item.taxonID
          themes.label(theme, 'right', 'Parent Name Usage ID', item.parentNameUsageID)
          tofile.ancestors[[`parentNameUsageID${i}`]] = item.parentNameUsageID
          themes.label(theme, 'right', 'Taxon Concept ID', item.taxonConceptID)
          tofile.ancestors[[`taxonConceptID${i}`]] = item.taxonConceptID
          themes.label(theme, 'right', 'Scientific Name', item.scientificName)
          tofile.ancestors[[`scientificName${i}`]] = item.scientificName
          themes.label(theme, 'right', 'Taxon Rank', item.taxonRank)
          tofile.ancestors[[`taxonRank${i}`]] = item.taxonRank
          themes.label(theme, 'right', 'Source', item.source)
          tofile.ancestors[[`source${i}`]] = item.source
        }
      }
      if (body.children !== []) {
        tofile.children = {}
        themes.label(theme, 'right', 'Children')
        for (let i = 0; i <= body.children.length - 1; i++) {
          const item = body.children[i]
          themes.label(theme, 'right', 'Source ID', item.sourceIdentifier)
          tofile.children[[`sourceIdentifier${i}`]] = item.sourceIdentifier
          themes.label(theme, 'right', 'Taxon ID', item.taxonID)
          tofile.children[[`taxonID${i}`]] = item.taxonID
          themes.label(theme, 'right', 'Parent Name Usage ID', item.parentNameUsageID)
          tofile.children[[`parentNameUsageID${i}`]] = item.parentNameUsageID
          themes.label(theme, 'right', 'Taxon Concept ID', item.taxonConceptID)
          tofile.children[[`taxonConceptID${i}`]] = item.taxonConceptID
          themes.label(theme, 'right', 'Scientific Name', item.scientificName)
          tofile.children[[`scientificName${i}`]] = item.scientificName
          themes.label(theme, 'right', 'Taxon Rank', item.taxonRank)
          tofile.children[[`taxonRank${i}`]] = item.taxonRank
          themes.label(theme, 'right', 'Source', item.source)
          tofile.children[[`source${i}`]] = item.source
        }
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    } else {
      throw new Error(error)
    }
  })
}
