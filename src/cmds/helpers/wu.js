/* eslint max-len:0 */
const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`
const config = noon.load(CFILE)
const theme = themes.loadTheme(config.theme)

function conditions(data, tofile) {
  console.log(`Current conditions for ${data.observation_location.full}:`)
  themes.label(theme, 'down', 'Current conditions', data.weather)
  if (config.wunder.metric) {
    themes.label(theme, 'right', 'Temperature (C)', data.temp_c)
    themes.label(theme, 'right', 'Wind', `${data.wind_kph}/kph ${data.wind_dir}, gusts ${data.wind_gust_kph}/kph`)
  } else {
    themes.label(theme, 'right', 'Temperature (F)', data.temp_f)
    themes.label(theme, 'right', 'Wind', `${data.wind_mph}/mph ${data.wind_dir}, gusts ${data.wind_gust_mph}/mph`)
  }
}
