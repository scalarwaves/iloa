import themes from '../../themes'
import tools from '../../tools'

import _ from 'lodash'
import noon from 'noon'

const CFILE = `${process.env.HOME}/.iloa.noon`
const config = noon.load(CFILE)
const theme = themes.loadTheme(config.theme)

/*
 * The main subpod handler
 * @param subpods {array} List of objects to process
 */
function subPod(subpods) {
  for (let i = 0; i <= subpods.length - 1; i++) {
    const sp = subpods[i]
    themes.label(theme, 'right', `Subpod ${i}`)
    themes.label(theme, 'right', 'Title', sp.title)
    themes.label(theme, 'right', 'Text', tools.wrapStr(tools.arrToStr(sp.plaintext)))
    themes.label(theme, 'right', 'Image', sp.img.src)
  }
}

/*
 * Single/Multiple subpod switch.
 * Calls: subPod()
 *
 * @param pods {array} List of pod objects
 * @param subpods {array} List of subpods
 */
function numSubPods(pods, subpods) {
  if (pods.numsubpods > 1) {
    subPod(subpods)
  } else {
    themes.label(theme, 'right', `Subpod ${pods.$.numsubpods}`)
    if (subpods.$.title !== '') themes.label(theme, 'right', 'Title', subpods.$.title)
    themes.label(theme, 'right', 'Text', tools.wrapStr(tools.arrToStr(subpods.plaintext)))
    themes.label(theme, 'right', 'Image', subpods.img[0].$.src)
  }
}

/*
 * The main pod handler
 * Calls: numSubPods()
 *
 * @param pods {object} List of pods to process
 */
function handlePods(pods) {
  for (let i = 0; i <= pods.length - 1; i++) {
    const p = pods[i]
    themes.label(theme, 'right', `Pod ${i}`)
    if (p.$.title !== '') themes.label(theme, 'right', 'Title', p.$.title)
    if (p.scanner !== undefined) themes.label(theme, 'right', 'Scanner', p.$.scanner)
    if (p.numsubpods !== undefined) themes.label(theme, 'right', 'Subpods', p.$.numsubpods)
    if (p.position !== undefined) themes.label(theme, 'right', 'Position', p.$.position)
    numSubPods(p, p.subpod[0])
  }
}

/*
 * Single/Multi pod switch.
 * Calls: handlePods() and numSubPods()
 *
 * @param pod {object} The pod to process
 */
exports.numPods = (pods) => {
  if (pods.length > 1) {
    handlePods(pods)
  } else {
    if (!pods.error) {
      themes.label(theme, 'right', `Pod ${pods.length}`)
      themes.label(theme, 'right', 'Title', pods.title)
      themes.label(theme, 'right', 'Text', tools.wrapStr(tools.arrToStr(pods.plaintext)))
      themes.label(theme, 'right', 'Scanner', pods.scanner)
      themes.label(theme, 'right', 'Subpods', pods.numsubpods)
      themes.label(theme, 'right', 'Position', pods.position)
      numSubPods(pods, pods.subpod)
    } else {
      console.log(`Pod error: ${pods.error}`)
    }
  }
}

/*
 * Handle Wolfram|Alpha's assumptions about your query.
 *
 * @param assumptions {object} A list of assumptions to process
 */
exports.assume = (assumptions) => {
  const assume = assumptions[0].assumption
  themes.label(theme, 'right', 'Assumptions')
  for (let i = 0; i <= assume.length - 1; i++) {
    const meta = assume[i].$
    const v = assume[i].value
    if (meta.type === 'Clash') {
      themes.label(theme, 'down', meta.type)
      const one = v[0].$.desc
      const two = v[1].$.desc
      console.log(`Assuming ${meta.word} is ${one}. Use ${two} instead.`)
    }
    if (meta.type === 'FormulaSolve') {
      themes.label(theme, 'right', meta.type)
      _.each(v, (val) => {
        themes.label(theme, 'right', val.$.desc, val.$.input)
      })
    }
    if (meta.type === 'FormulaSelect') {
      themes.label(theme, 'down', meta.type)
      const one = v[0].$.desc
      const two = v[1].$.desc
      console.log(`Assuming ${one}. Use ${two} instead.`)
    }
    if (meta.type === 'FormulaVariable') {
      themes.label(theme, 'down', meta.type)
      console.log(`${meta.desc}: ${v[0].$.desc}`)
    }
    if (meta.type === 'FormulaVariableOption') {
      themes.label(theme, 'down', meta.type)
      const one = v[0].$.desc
      const two = v[1].$.desc
      console.log(`Assuming ${one}. Use ${two} instead.`)
    }
    if (meta.type === 'FormulaVariableInclude') {
      themes.label(theme, 'down', meta.type)
      const one = v[0].$.desc
      console.log(`Assuming ${one}.`)
    }
  }
}
