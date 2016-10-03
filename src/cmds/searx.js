/* eslint max-len: 0 */
import themes from '../themes'
import tools from '../tools'

import _ from 'lodash'
import chalk from 'chalk'
import noon from 'noon'
import ora from 'ora'
import xray from 'x-ray'

const CFILE = `${process.env.HOME}/.iloa.noon`

const general = ['ai', 'wp', 'bi', 'cc', 'ddd', 'ew', 'wd', 'ddg', 'gb', 'go', 'qw', 're', 'sp', 'iq', 'sw', 'yh', 'yn', 'dc', 'tl']
const files = ['dbt', 'fd', 'gpa', 'nt', 'or', 'tpb', 'tt']
const images = ['bii', 'da', 'px', '1x', 'fl', 'frk', 'goi', 'nt', 'qwi', 're', 'sw']
const it = ['al', 'bb', 'gl', 'gh', 'gt', 'habr', 'ho', 'st', 'scd', 'scc']
const map = ['osm', 'ph']
const music = ['dz', 'dbt', 'gps', 'mc', 'nt', 'tpb', 'sc', 'tt', 'yt']
const news = ['bin', 'dg', 'gon', 'qwn', 're', 'yhn']
const science = ['bs', 'cr', 'gos', 'ma', 'scs', 'wa']
const socialMedia = ['dg', 'qws', 're', 'tw']
const videos = ['dbt', 'gpm', 'in', 'nt', 'tpb', 'ss', 'tt', 'yt', 'dm', 'vm']

exports.command = 'searx <query>'
exports.desc = 'Metasearch searx.me'
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
  cat: {
    alias: 'c',
    desc: 'comma-separated: general,files,images,it,map,music,news,science,social+media,videos',
    default: '',
    type: 'string',
  },
  engine: {
    alias: 'e',
    desc: 'comma-separated engines',
    default: '',
    type: 'string',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'searx')
  const prefix = 'https://searx.me/?q='
  const scont = []
  scont.push(argv.query)
  if (argv._.length > 1) {
    _.each(argv._, (value) => {
      if (value !== 'searx') scont.push(value)
    })
  }
  let words = ''
  if (scont.length > 1) {
    words = scont.join('+')
  } else {
    words = scont[0]
  }
  const ccont = argv.cat.split(',')
  const cassy = []
  if (ccont.length > 1) {
    _.each(ccont, (value) => {
      cassy.push(`&category_${value}=on`)
    })
  } else if (ccont.length === 1) {
    cassy.push(`&category_${ccont[0]}=on`)
  } else cassy.push('&category_none=1')
  const econt = argv.engine.split(',')
  const eassy = []
  if (econt.length > 1) {
    _.each(econt, (value) => {
      if (ccont.general !== undefined) if (general[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.files !== undefined) if (files[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.images !== undefined) if (images[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.it !== undefined) if (it[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.general !== undefined) if (general[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.map !== undefined) if (map[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.music !== undefined) if (music[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.news !== undefined) if (news[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.science !== undefined) if (science[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.socialmedia !== undefined) if (socialMedia[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
      if (ccont.videos !== undefined) if (videos[value] !== undefined && eassy[value] !== undefined) eassy.push(`%21${value}+`)
    })
  } else eassy.push(`%21${econt[0]}`)
  const url = `${prefix}${eassy.join('')}${words}${cassy.join('')}`
  const tofile = {
    type: 'searx',
    source: 'https://searx.me/',
    url,
  }
  const spinner = ora({
    text: `${chalk.bold.cyan('Loading results...')}`,
    spinner: 'dots8',
    color: 'yellow',
  })
  spinner.start()
  const x = xray()
  x(url, {
    h: 'body@html',
    r: ['.result', '.result-default', '.result-content'],
  })((err, body) => {
    spinner.stop()
    spinner.clear()
    const icont = []
    _.map(body.r, (value) => icont.push(value.trim().replace(/cached/, '').replace(/ {2,}/mig, '').replace(/\n{2,}/mig, '\n')))
    const links = body.h.match(/(<a(?:(?!\/a>).|\n)*(?=>).)(.+)(<\/a>)/mig)
    const lcont = []
    _.each(links, (value) => lcont.push(value.replace(/<a href="/mig, '').replace(/".*<\/a>/, '')))
    lcont.pop(); lcont.shift(); lcont.shift(); lcont.shift(); lcont.shift()
    const nlink = []
    _.map(lcont, (value) => {
      if (!/https:\/\/web\.archive\.org\/web/mig.test(value) && !/https?:\/\/[a-z0-9\.\/]*\[\.\.\.\][a-z0-9_\-\.\/\?=]*/mig.test(value)) nlink.push(value)
    })
    const tcont = []
    _.map(icont, (value) => tcont.push(value.replace(/[…a-z0-9\-_\.\s]*https?:\/\/[a-z0-9\.\/\[\]_\?\-#]*$/mig, '\n')))
    _.map(tcont, (value) => {
      value.replace(/&lt;/, '<')
      value.replace(/&gt;/, '>')
    })
    themes.label(theme, 'down', 'searx', decodeURI(`!${ccont.join(' !')} !${econt.join(' !')} ${scont.join(' ')}`))
    for (let y = 0; y <= tcont.length - 1; y++) {
      console.log(`${tcont[y]}\n${chalk.underline(nlink[y])}\n\n`)
      tofile[[`text${y}`]] = tcont[y]
      tofile[[`link${y}`]] = nlink[y]
    }
    if (argv.o) tools.outFile(argv.o, argv.f, tofile)
  })
}
