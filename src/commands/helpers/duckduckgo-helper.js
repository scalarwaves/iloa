const themes = require('../../themes')
const tools = require('../../tools')

const noon = require('noon')

exports.Article = (body, tofile) => {
  let tf = tofile
  const CFILE = `${process.env.HOME}/.iloa.noon`
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  themes.label(theme, 'right', 'Title', body.Heading)
  themes.label(theme, 'right', 'Entity', body.Entity)
  themes.label(theme, 'right', 'Source', body.AbstractSource)
  themes.label(theme, 'right', 'URL', body.AbstractURL)
  themes.label(theme, 'right', 'Text', tools.wrapStr(body.AbstractText, true, true))
  if (body.Results.length > 0) {
    themes.label(theme, 'down', 'Primary Results')
    for (let i = 0; i <= body.Results - 1; i++) {
      const res = body.Results[i]
      console.log(`${res.Text}\n${res.FirstURL}`)
      tofile[[`resultText${i}`]] = res.Text
      tofile[[`resultUrl${i}`]] = res.FirstURL
    }
  }
  tofile.title = body.Heading
  tofile.entity = body.Entity
  tofile.abstractSource = body.AbstractSource
  tofile.abstractUrl = body.AbstractURL
  tofile.text = body.AbstractText
  return tf
}
exports.Abstract = (body, tofile) => {
  let tf = tofile
  const CFILE = `${process.env.HOME}/.iloa.noon`
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  themes.label(theme, 'right', 'Title', body.Heading)
  themes.label(theme, 'right', 'Source', body.AbstractSource)
  themes.label(theme, 'right', 'URL', body.AbstractURL)
  tofile.title = body.Heading
  tofile.abstractSource = body.AbstractSource
  tofile.abstractUrl = body.AbstractURL
  return tf
}
exports.Image = (body, tofile) => {
  let tf = tofile
  const CFILE = `${process.env.HOME}/.iloa.noon`
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  themes.label(theme, 'right', 'Image URL', body.Image)
  tofile.image = body.Image
  return tf
}
exports.Raw = (body, tofile) => {
  let tf = tofile
  const CFILE = `${process.env.HOME}/.iloa.noon`
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  themes.label(theme, 'right', 'Answer Type', body.AnswerType)
  console.log(body.Answer)
  return tf
}
exports.RelatedTopics = (body, tofile) => {
  let tf = tofile
  const CFILE = `${process.env.HOME}/.iloa.noon`
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  const rtArray = body.RelatedTopics
  const rcont = []
  const tcont = []
  for (let i = 0; i <= rtArray.length - 1; i++) {
    const hash = rtArray[i]
    if (hash.Result !== undefined) {
      rcont.push(hash)
    } else if (hash.Name !== undefined) {
      tcont.push(hash)
    }
  }
  if (rcont !== []) {
    themes.label(theme, 'down', 'Related')
    for (let i = 0; i <= rcont.length - 1; i++) {
      const rhash = rcont[i]
      console.log(`${tools.wrapStr(rhash.Text, true, true)}\n${rhash.FirstURL}`)
      tofile[[`relatedText${i}`]] = rhash.Text
      tofile[[`relatedUrl${i}`]] = rhash.FirstURL
    }
  }
  if (tcont !== []) {
    for (let i = 0; i <= tcont.length - 1; i++) {
      const thash = tcont[i]
      themes.label(theme, 'right', 'Topics', thash.Name)
      tofile[[`topicName${i}`]] = thash.Name
      const tArray = thash.Topics
      for (let j = 0; j <= tArray.length - 1; j++) {
        const tResult = tArray[j]
        console.log(`${tResult.Text}\n${tResult.FirstURL}`)
        tofile[[`topicText${i}`]] = tResult.Text
        tofile[[`topicUrl${i}`]] = tResult.FirstURL
      }
    }
  }
  return tf
}
