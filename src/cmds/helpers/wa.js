const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.iloa.noon`
const config = noon.load(CFILE)
const theme = themes.loadTheme(config.theme)

/*
 * The main subpod handler
 * @param pn {number} The pod number
 * @param subpods {array} List of objects to process
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
function subPod(pn, subpod, tofile) {
  const tf = tofile
  for (let i = 0; i <= subpod.length - 1; i++) {
    const sp = subpod[i]
    const meta = sp.$
    tf[[`pod${pn}`]][[`subpod${i}`]] = {}
    themes.label(theme, 'right', `Subpod ${i}`)
    if (meta.title !== '') {
      themes.label(theme, 'right', 'Title', meta.title)
      tf[[`pod${pn}`]][[`subpod${i}`]].title = meta.title
    }
    themes.label(theme, 'right', 'Text', tools.wrapStr(tools.arrToStr(sp.plaintext), true, true))
    tf[[`pod${pn}`]][[`subpod${i}`]].text = tools.arrToStr(sp.plaintext)
    themes.label(theme, 'right', 'Image', sp.img[0].$.src)
    tf[[`pod${pn}`]][[`subpod${i}`]].image = sp.img[0].$.src
  }
  return tf
}

/*
 * The main pod handler
 * Calls: subPod()
 *
 * @param pods {object} List of pods to process
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
function handlePods(pods, tofile) {
  let tf = tofile
  for (let i = 0; i <= pods.length - 1; i++) {
    const p = pods[i]
    const meta = p.$
    tf[[`pod${i}`]] = {}
    themes.label(theme, 'right', `Pod ${i}`)
    if (meta.title !== '') {
      themes.label(theme, 'right', 'Title', meta.title)
      tf[[`pod${i}`]].title = meta.title
    }
    if (meta.scanner !== undefined) {
      themes.label(theme, 'right', 'Scanner', meta.scanner)
      tf[[`pod${i}`]].scanner = meta.scanner
    }
    if (meta.numsubpods !== undefined) {
      themes.label(theme, 'right', 'Subpods', parseInt(meta.numsubpods, 10))
      tf[[`pod${i}`]].subpods = parseInt(meta.numsubpods, 10)
    }
    if (meta.position !== undefined) {
      themes.label(theme, 'right', 'Position', parseInt(meta.position, 10))
      tf[[`pod${i}`]].position = parseInt(meta.position, 10)
    }
    tf = subPod(i, p.subpod, tf)
  }
  return tf
}

/*
 * Pod error handler.
 * Calls: handlePods()
 *
 * @param pods {object} The pods to process
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
exports.numPods = (pods, tofile) => {
  let tf = tofile
  if (!pods.error) {
    tf = handlePods(pods, tf)
  } else {
    console.log(`Pod error: ${pods.error}`)
  }
  return tf
}

/*
 * Handle Wolfram|Alpha's assumptions about your query.
 *
 * @param assumptions {object} A list of assumptions to process
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
exports.assume = (assumptions, tofile) => {
  const tf = tofile
  const assume = assumptions[0].assumption
  themes.label(theme, 'right', 'Assumptions')
  for (let i = 0; i <= assume.length - 1; i++) {
    tf[[`assumption${i}`]] = {}
    const meta = assume[i].$
    const v = assume[i].value
    tf[[`assumption${i}`]].type = meta.type
    if (meta.type === 'Clash') {
      themes.label(theme, 'down', meta.type)
      const one = v[0].$.desc
      const two = v[1].$.desc
      tf[[`assumption${i}`]].clash = `Assuming ${meta.word} is ${one}. Use ${two} instead.`
      console.log(`Assuming ${meta.word} is ${one}. Use ${two} instead.`)
    }
    if (meta.type === 'FormulaSolve') {
      themes.label(theme, 'right', meta.type)
      _.each(v, (val) => {
        themes.label(theme, 'right', val.$.desc, val.$.input)
        tf[[`assumption${i}`]][[`${val.$.desc}`]] = val.$.input
      })
    }
    if (meta.type === 'FormulaSelect') {
      themes.label(theme, 'down', meta.type)
      const one = v[0].$.desc
      const two = v[1].$.desc
      tf[[`assumption${i}`]].formulaSelect = `Assuming ${one}. Use ${two} instead.`
      console.log(`Assuming ${one}. Use ${two} instead.`)
    }
    if (meta.type === 'FormulaVariable') {
      themes.label(theme, 'down', meta.type)
      console.log(`${meta.desc}: ${v[0].$.desc}`)
      tf[[`assumption${i}`]][[`${meta.desc}`]] = v[0].$.desc
    }
    if (meta.type === 'FormulaVariableOption') {
      themes.label(theme, 'down', meta.type)
      const one = v[0].$.desc
      const two = v[1].$.desc
      tf[[`assumption${i}`]].formulaVariableOption = `Assuming ${one}. Use ${two} instead.`
      console.log(`Assuming ${one}. Use ${two} instead.`)
    }
    if (meta.type === 'FormulaVariableInclude') {
      themes.label(theme, 'down', meta.type)
      const one = v[0].$.desc
      tf[[`assumption${i}`]].formulaVariableInclude = one
      console.log(`Assuming ${one}.`)
    }
  }
  return tf
}
