/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'page <id>'
exports.aliases = ['pg']
exports.desc = 'Returns data for a given page ID number'
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
  batch: {
    alias: 'b',
    desc: 'Batch response',
    default: false,
    type: 'boolean'
  },
  imagepage: {
    desc: 'Which images page',
    default: 1,
    type: 'number'
  },
  imagepp: {
    desc: 'No. of images/page 0-75',
    default: 1,
    type: 'number'
  },
  videopage: {
    desc: 'Which videos page',
    default: 1,
    type: 'number'
  },
  videopp: {
    desc: 'No. of videos/page 0-75',
    default: 1,
    type: 'number'
  },
  soundpage: {
    desc: 'Which sounds page',
    default: 1,
    type: 'number'
  },
  soundpp: {
    desc: 'No. of sounds/page 0-75',
    default: 1,
    type: 'number'
  },
  mapspage: {
    desc: 'Which maps page',
    default: 1,
    type: 'number'
  },
  mapspp: {
    desc: 'No. of maps/page 0-75',
    default: 1,
    type: 'number'
  },
  textpage: {
    desc: 'Which texts page',
    default: 1,
    type: 'number'
  },
  textpp: {
    desc: 'No. of texts/page 0-75',
    default: 1,
    type: 'number'
  },
  iucn: {
    alias: 'n',
    desc: 'IUCN Red List status',
    default: false,
    type: 'boolean'
  },
  subjects: {
    alias: 'j',
    desc: tools.wrapStr("'overview' to return the overview text (if exists), a pipe | delimited list of subject names from the list of EOL accepted subjects (e.g. TaxonBiology, FossilHistory), or 'all' to get text in any subject. Always returns an overview text as a first result (if one exists in the given context).", true, true),
    default: 'overview',
    type: 'string'
  },
  license: {
    alias: 'l',
    desc: tools.wrapStr("a pipe | delimited list of licenses or 'all' to get objects under any license. Licenses abbreviated cc- are all Creative Commons licenses. Visit their site for more information on the various licenses they offer.", true, true),
    default: 'all',
    type: 'string'
  },
  details: {
    alias: 'd',
    desc: 'Include all metadata for data objects',
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
  reference: {
    alias: 'r',
    desc: "All references for the page's taxon",
    default: false,
    type: 'boolean'
  },
  taxonomy: {
    alias: 'x',
    desc: tools.wrapStr("Any taxonomy details from different taxon hierarchy providers, in an array named 'taxonConcepts'", true, true),
    default: true,
    type: 'boolean'
  },
  vetted: {
    alias: 'e',
    desc: tools.wrapStr("If 'vetted' is given a value of '1', then only trusted content will be returned. If 'vetted' is '2', then only trusted and unreviewed content will be returned (untrusted content will not be returned). If 'vetted' is '3', then only unreviewed content will be returned. If 'vetted' is '4', then only untrusted content will be returned.The default is to return all content.", true, true),
    default: 0,
    type: 'number'
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
    batch: argv.b,
    id: argv.id,
    imagepage: argv.imagepage,
    imagepp: argv.imagepp,
    videopage: argv.videopage,
    videopp: argv.videopp,
    mapspage: argv.mapspage,
    mapspp: argv.mapspp,
    soundpage: argv.soundpage,
    soundpp: argv.soundpp,
    textpage: argv.textpage,
    textpp: argv.textpp,
    iucn: argv.n,
    subjects: argv.j,
    license: argv.l,
    details: argv.d,
    common: argv.m,
    synonym: argv.y,
    reference: argv.r,
    taxonomy: argv.x,
    vetted: argv.e,
    cachettl: argv.c,
    language: argv.g
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  if (argv.s && config.merge) noon.save(CFILE, config)
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Encyclopedia of Life')
  const prefix = 'http://eol.org/api/pages/1.0.json'
  const ucont = []
  ucont.push(`batch=${argv.b}`)
  ucont.push(`id=${argv.id}`)
  ucont.push(`images_page=${argv.imagepage}`)
  ucont.push(`images_per_page=${argv.imagepp}`)
  ucont.push(`videos_page=${argv.videopage}`)
  ucont.push(`videos_per_page=${argv.videopp}`)
  ucont.push(`sounds_page=${argv.soundpage}`)
  ucont.push(`sounds_per_page=${argv.soundpp}`)
  ucont.push(`texts_page=${argv.textpage}`)
  ucont.push(`texts_per_page=${argv.textpp}`)
  ucont.push(`maps_page=${argv.mapspage}`)
  ucont.push(`maps_per_page=${argv.mapspp}`)
  ucont.push(`iucn=${argv.n}`)
  ucont.push(`subjects=${argv.j}`)
  ucont.push(`licenses=${argv.l}`)
  ucont.push(`details=${argv.d}`)
  ucont.push(`common_names=${argv.m}`)
  ucont.push(`synonyms=${argv.y}`)
  ucont.push(`references=${argv.r}`)
  ucont.push(`taxonomy=${argv.x}`)
  ucont.push(`vetted=${argv.e}`)
  ucont.push(`cachettl=${argv.c}`)
  ucont.push(`language=${argv.g}`)
  ucont.push(`key=${process.env.EOLKEY}`)
  const url = `${prefix}?${ucont.join('&')}`
  const tofile = {
    type: 'pages',
    source: 'http://eol.org'
  }
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      themes.label(theme, 'right', 'Identifier', body.identifier)
      tofile.id = body.identifier
      themes.label(theme, 'right', 'Scientific Name', body.scientificName)
      tofile.scientificName = body.scientificName
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
      if (body.references) {
        tofile.references = {}
        themes.label(theme, 'right', 'References')
        for (let i = 0; i <= body.references - 1; i++) {
          console.log(tools.wrapStr(body.references[i], true, true))
          tofile.references[[`ref${i}`]] = body.references[i]
        }
      }
      if (body.synonyms) {
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
      if (body.dataObjects && body.dataObjects !== []) {
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
          if (item.subject) {
            themes.label(theme, 'right', 'subject', item.subject)
            tofile.dataObjects[[`subject${i}`]] = item.subject
          }
          if (item.mimeType) {
            themes.label(theme, 'right', 'mimeType', item.mimeType)
            tofile.dataObjects[[`mimeType${i}`]] = item.mimeType
          }
          const dtprefix = 'http://purl.org/dc/dcmitype/'
          if (item.dataType === `${dtprefix}StillImage` || item.dataType === `${dtprefix}MovingImage` || item.dataType === `${dtprefix}Sound`) {
            if (item.title) {
              themes.label(theme, 'right', 'Title', item.title)
              tofile.dataObjects[[`title${i}`]] = item.title
            }
            if (item.mediaURL) {
              themes.label(theme, 'right', 'URL', item.mediaURL)
              tofile.dataObjects[[`mediaURL${i}`]] = item.mediaURL
            }
            if (item.location) {
              themes.label(theme, 'right', 'Location', item.location)
              tofile.dataObjects[[`location${i}`]] = item.location
            }
            if (item.eolMediaURL) {
              themes.label(theme, 'right', 'EOL URL', item.eolMediaURL)
              tofile.dataObjects[[`eolMediaURL${i}`]] = item.eolMediaURL
            }
          }
          if (item.created) {
            themes.label(theme, 'right', 'created', item.created)
            tofile.dataObjects[[`created${i}`]] = item.created
          }
          if (item.modified) {
            themes.label(theme, 'right', 'modified', item.modified)
            tofile.dataObjects[[`modified${i}`]] = item.modified
          }
          if (item.language) {
            themes.label(theme, 'right', 'language', item.language)
            tofile.dataObjects[[`language${i}`]] = item.language
          }
          if (item.license) {
            themes.label(theme, 'right', 'license', item.license)
            tofile.dataObjects[[`license${i}`]] = item.license
          }
          if (item.rightsHolder) {
            themes.label(theme, 'right', 'rightsHolder', item.rightsHolder)
            tofile.dataObjects[[`rightsHolder${i}`]] = item.rightsHolder
          }
          if (item.source) {
            themes.label(theme, 'right', 'source', item.source)
            tofile.dataObjects[[`source${i}`]] = item.source
          }
          if (item.description) {
            themes.label(theme, 'right', 'description', tools.wrapStr(item.description, true, true))
            tofile.dataObjects[[`description${i}`]] = item.description
          }
          if (item.agents && item.agents !== []) {
            themes.label(theme, 'right', 'Agents')
            tofile.dataObjects[[`agent${i}`]] = {}
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
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    } else {
      throw new Error(error)
    }
  })
}
