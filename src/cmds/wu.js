/* eslint max-len:0 */
const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const moment = require('moment')
const noon = require('noon')
const http = require('good-guy-http')({
  cache: false,
})

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'wu <query>'
exports.desc = 'Query Weather Underground'
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
  features: {
    alias: 'e',
    desc: 'CSV alerts,almanac,animatedradar,animatedsatellite,animatedradar/animatedsatellite,astronomy,conditions,currenthurricane,forecast,forecast10day,geolookup,history,hourly,hourly10day,planner,radar,radar/satellite,rawtide,satellite,tide,webcams,yesterday',
    default: 'conditions',
    type: 'string',
  },
  lang: {
    alias: 'l',
    desc: '2-letter language codes listed here: https://www.wunderground.com/weather/api/d/docs?d=language-support',
    default: 'EN',
    type: 'string',
  },
  limit: {
    alias: 't',
    desc: 'Limit number of results returned',
    default: 5,
    type: 'number',
  },
  pws: {
    alias: 'p',
    desc: 'Use personal weather stations for weather conditions',
    default: true,
    type: 'boolean',
  },
  bestf: {
    alias: 'b',
    desc: 'Use Wunderground Best Forecast',
    default: true,
    type: 'boolean',
  },
  save: {
    alias: 's',
    desc: 'Save flags to config file',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  let dproceed = false
  let mproceed = false
  let dreset = false
  let mreset = false
  const dstamp = new Date(config.wunder.date.dstamp)
  const mstamp = new Date(config.wunder.date.mstamp)
  const day = moment(new Date).diff(dstamp, 'hours')
  const hour = moment(new Date).diff(mstamp, 'minutes')
  const minute = moment(new Date).diff(mstamp, 'seconds')
  const checkStamp = tools.limitWunder(config)
  config = checkStamp[0]
  dproceed = checkStamp[1]
  mproceed = checkStamp[2]
  dreset = checkStamp[3]
  mreset = checkStamp[4]
  if (dproceed && mproceed) {
    const features = argv.e.split(',').join('/')
    const userConfig = {
      bestf: argv.b,
      features: features.split('/'),
      lang: argv.l,
      limit: argv.t,
      pws: argv.p,
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    if (argv.s && config.merge) noon.save(CFILE, config)
    if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Wunderground')
    const scont = []
    scont.push(`lang:${config.wunder.lang.toUpperCase()}`)
    config.wunder.pws ? scont.push('pws:1') : scont.push('pws:0')
    config.wunder.bestf ? scont.push('bestfct:1') : scont.push('bestfct:0')
    const query = argv.query
    const apikey = process.env.WUNDERGROUND
    const url = encodeURI(`https://api.wunderground.com/api/${apikey}/${features}/${scont.join('/')}/q/${query}.json`)
    let tofile = {
      type: 'wunderground',
      source: 'https://www.wunderground.com/?apiref=f6e0dc6b44f8fee2',
    }
    http({ url }, (error, response) => {
      if (!error && response.statusCode === 200) {
        const body = JSON.parse(response.body)
        if (body.response.error) throw new Error(body.response.error.description)
        const helpers = require('./helpers/wu')
        if (body.response.features.alerts === 1) tofile = helpers.alerts(body.alerts, tofile)
        if (body.response.features.almanac === 1) tofile = helpers.almanac(body.almanac, tofile)
        if (body.response.features.astronomy === 1) tofile = helpers.astronomy(body.moon_phase, tofile)
        if (body.response.features.conditions === 1) tofile = helpers.conditions(body.current_observation, tofile)
        if (body.response.features.forecast === 1 || body.response.features.forecast10day === 1) tofile = helpers.forecast(body.forecast, tofile)
        if (body.response.features.geolookup === 1) tofile = helpers.geolookup(body.location, argv.t, tofile)
        if (body.response.features.hourly === 1 || body.response.features.hourly10day === 1) tofile = helpers.hourly(body.hourly_forecast, tofile)
        if (body.response.features.tide === 1) tofile = helpers.tide(body.tide, tofile)
        if (body.response.features.webcams === 1) tofile = helpers.webcams(body.webcams, argv.t, tofile)
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (config.usage) {
          dreset ? console.log(`Timestamp expired, reset usage limits.\n${config.wunder.date.dremain}/${config.wunder.date.dlimit} requests remaining today.`) : console.log(`${config.wunder.date.dremain}/${config.wunder.date.dlimit} requests remaining today, will reset in ${24 - day} hours, ${60 - hour} minutes, ${60 - minute} seconds.`)
          mreset ? console.log(`Timestamp expired, reset usage limits.\n${config.wunder.date.mremain}/${config.wunder.date.mlimit} requests remaining this minute.`) : console.log(`${config.wunder.date.mremain}/${config.wunder.date.mlimit} requests remaining this minute, will reset in ${60 - minute} seconds.`)
        }
      } else {
        throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
      }
    })
  } else if (!dproceed) {
    throw new Error(`Reached today's usage limit of ${config.wunder.date.dlimit}.`)
  } else if (!mproceed) console.log(`Reached usage limit of ${config.wunder.date.mlimit}, please wait a minute.`)
}
