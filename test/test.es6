/* eslint-disable no-undef: 0, no-useless-escape: 0, handle-callback-err: 0, quotes: 0, no-unused-vars: 0 */
const themes = require('../bin/themes')
const tools = require('../bin/tools')

const child = require('child_process')
const expect = require('chai').expect
const fs = require('fs-extra')
const noon = require('noon')
const sinon = require('sinon')
const wrap = require('wrap-ansi')
const version = require('../package.json').version

const CFILE = `${process.env.HOME}/.iloa.noon`
const TFILE = `${process.cwd()}/test/test.config.noon`
const spy = sinon.spy(console, 'log')

describe('tools', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    fs.copySync(CFILE, 'test/output/saved.config.noon')
    done()
  })
  beforeEach((done) => {
    spy.reset()
    done()
  })
  after((done) => {
    fs.copySync('test/output/saved.config.noon', CFILE)
    fs.removeSync('test/output')
    done()
  })
  describe('check boolean', () => {
    it('coerces true', (done) => {
      expect(tools.checkBoolean('true')).to.be.true
      done()
    })
    it('coerces false', (done) => {
      expect(tools.checkBoolean('false')).to.be.false
      done()
    })
  })
  describe('check outfile', () => {
    it('json exists', (done) => {
      const obj = { foo: 'bar' }
      const obj2 = { bar: 'foo' }
      tools.outFile('test/output/test.json', false, obj)
      expect(spy.calledWith(tools.outFile('test/output/test.json', false, obj2))).to.match(/[a-z/,-. ]*/mig)
      const actual = fs.readJsonSync('test/output/test.json')
      expect(actual).to.deep.equal(obj)
      fs.removeSync('test/output/test.json')
      done()
    })
    it("json doesn't exist", (done) => {
      const obj = { foo: 'bar' }
      expect(spy.calledWith(tools.outFile('test/output/test.json', false, obj))).to.match(/[a-z/,-. ]*/mig)
      fs.removeSync('test/output/test.json')
      done()
    })
    it('xml exists', (done) => {
      const obj = { foo: 'bar' }
      tools.outFile('test/output/test.xml', false, obj)
      tools.outFile('test/output/test.xml', false, obj)
      done()
    })
    it('enforces supported formats', (done) => {
      const obj = { foo: 'bar' }
      try {
        tools.outFile('test/output/test.foo', false, obj)
      } catch (error) {
        console.log(error)
        done()
      }
    })
  })
  describe('check config', () => {
    it('config exists', (done) => {
      fs.copySync('test/output/saved.config.noon', CFILE)
      expect(tools.checkConfig(CFILE)).to.be.true
      done()
    })
    it("config doesn't exist", (done) => {
      fs.removeSync(CFILE)
      try {
        tools.checkConfig(CFILE)
      } catch (error) {
        console.log(error)
        done()
      }
    })
  })
  describe('array to string', () => {
    const array = ['enclosed string']
    const string = 'normal string'
    it('extracts string from array', (done) => {
      expect(tools.arrToStr(array)).to.equals('enclosed string')
      done()
    })
    it('returns string when not enclosed', (done) => {
      expect(tools.arrToStr(string)).to.equals('normal string')
      done()
    })
  })
  describe('boolean to binary', () => {
    const bool = true
    it('returns a zero or one', (done) => {
      expect(tools.boolToBin(bool)).to.equals(1)
      done()
    })
  })
  describe('strip HTML', () => {
    const str = '<b>hello</b>'
    it('returns a normal string', (done) => {
      expect(tools.stripHTML(str)).to.equals('hello')
      done()
    })
  })
  describe('wrap string', () => {
    const str = 'The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.'
    it('wraps with ANSI escape codes', (done) => {
      tools.wrapStr(str, true, true)
      const wrappedstr = wrap(str, 20, true, true)
      console.log(wrappedstr)
      done()
    })
  })
  describe('rate-limiting', () => {
    it('resets wolfram limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.wolf.date.stamp = new Date().toJSON().replace(/2016/, '2015')
      config.wolf.date.remain = 1998
      const checkStamp = tools.limitWolf(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.wolf.date.remain).to.match(/\d+/mig)
      expect(c.wolf.date.stamp).to.match(/201\d[-\d]*T[0-9:.-Z]*/mig)
      expect(proceed).to.be.true
      expect(reset).to.be.false
      done()
    })
    it('decrements wolfram limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.wolf.date.stamp = new Date().toJSON()
      config.wolf.date.remain = 2000
      const checkStamp = tools.limitWolf(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.wolf.date.remain).to.equals(1999)
      expect(proceed).to.be.true
      expect(reset).to.be.false
      done()
    })
    it('resets wunder limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.wunder.date.dstamp = new Date().toJSON().replace(/2017/, '2016')
      config.wunder.date.mstamp = new Date().toJSON().replace(/2017/, '2016')
      config.wunder.date.dremain = 498
      config.wunder.date.mremain = 8
      const checkStamp = tools.limitWunder(config)
      const c = checkStamp[0]
      const dproceed = checkStamp[1]
      const mproceed = checkStamp[2]
      const dreset = checkStamp[3]
      const mreset = checkStamp[4]
      expect(c.wunder.date.dremain).to.equals(499)
      expect(c.wunder.date.mremain).to.equals(9)
      expect(c.wunder.date.dstamp).to.match(/201\d[-\d]*T[0-9:.\-Z]*/mig)
      expect(c.wunder.date.mstamp).to.match(/201\d[-\d]*T[0-9:.\-Z]*/mig)
      expect(dproceed).to.be.true
      expect(mproceed).to.be.true
      expect(dreset).to.be.true
      expect(mreset).to.be.true
      done()
    })
    it('decrements wunder limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.wunder.date.dstamp = new Date().toJSON()
      config.wunder.date.mstamp = new Date().toJSON()
      config.wunder.date.dremain = 500
      config.wunder.date.mremain = 10
      const checkStamp = tools.limitWunder(config)
      const c = checkStamp[0]
      const dproceed = checkStamp[1]
      const mproceed = checkStamp[2]
      const dreset = checkStamp[3]
      const mreset = checkStamp[4]
      expect(c.wunder.date.dremain).to.equals(499)
      expect(c.wunder.date.mremain).to.equals(9)
      expect(dproceed).to.be.true
      expect(mproceed).to.be.true
      expect(dreset).to.be.false
      expect(mreset).to.be.false
      done()
    })
  })
})

describe('themes', () => {
  beforeEach(() => {
    spy.reset()
  })
  after(() => spy.restore())
  describe('get themes', () => {
    it('returns an array of theme names', (done) => {
      const list = themes.getThemes().sort()
      const obj = ['colonel', 'markup', 'square']
      expect(list).to.deep.equal(obj)
      done()
    })
  })
  describe('load theme', () => {
    it('returns a theme', (done) => {
      const theme = themes.loadTheme('square')
      const obj = {
        prefix: {
          str: '[',
          style: 'bold.green'
        },
        text: {
          style: 'bold.white'
        },
        content: {
          style: 'white'
        },
        suffix: {
          str: ']',
          style: 'bold.green'
        },
        connector: {
          str: '→',
          style: 'bold.cyan'
        }
      }
      expect(theme).to.deep.equal(obj)
      done()
    })
  })
  describe('labels', () => {
    const theme = themes.loadTheme('square')
    const text = 'label'
    it('labels right', (done) => {
      const content = 'right'
      expect(spy.calledWith(themes.label(theme, 'right', text, content))).to.be.true
      done()
    })
    it('labels down', (done) => {
      const content = 'down'
      expect(spy.calledWith(themes.label(theme, 'down', text, content))).to.be.true
      done()
    })
    it('labels without content', (done) => {
      expect(spy.calledWith(themes.label(theme, 'right', text))).to.be.true
      done()
    })
    it('enforces right or down', (done) => {
      try {
        themes.label(theme, 'err', 'label')
      } catch (error) {
        console.log(error)
        done()
      }
    })
  })
  describe('no theme dir', () => {
    it('falls back', (done) => {
      let TDIR = null
      const themeDirExists = false
      themeDirExists ? TDIR = 'themes/' : TDIR = `${process.env.NODE_PATH}/leximaven/themes/`
      themes.loadTheme('square')
      themes.getThemes()
      expect(TDIR).to.equals(`${process.env.NODE_PATH}/leximaven/themes/`)
      done()
    })
  })
})

describe('config commands', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    fs.copySync(CFILE, 'test/output/saved.config.noon')
    done()
  })
  after((done) => {
    fs.copySync('test/output/saved.config.noon', CFILE)
    fs.removeSync('test/output')
    done()
  })
  describe('init', () => {
    before((done) => {
      fs.removeSync(CFILE)
      done()
    })
    it('creates the config file', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js config init > test/output/config-init.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-init.out', 'utf8')
        const config = noon.load(CFILE)
        const obj = {
          eol: {
            collect: {
              by: 'recently_added',
              cachettl: 60,
              field: '',
              filter: '',
              language: 'en',
              page: 1,
              ppage: 50
            },
            entry: {
              cachettl: 60,
              common: false,
              language: 'en',
              synonym: false
            },
            hier: {
              cachettl: 60,
              language: 'en'
            },
            meta: {
              cachettl: 60,
              language: 'en',
              taxonomy: true
            },
            page: {
              batch: false,
              cachettl: 60,
              common: false,
              details: false,
              imagepage: 1,
              imagepp: 1,
              iucn: false,
              language: 'en',
              license: 'all',
              mapspage: 1,
              mapspp: 1,
              reference: false,
              soundpage: 1,
              soundpp: 1,
              subjects: 'overview',
              synonym: false,
              taxonomy: true,
              textpage: 1,
              textpp: 1,
              vetted: 0,
              videopage: 1,
              videopp: 1
            },
            sbp: {
              cachettl: 60,
              pid: 903
            },
            search: {
              cachettl: 60,
              exact: false,
              hfilter: 0,
              page: 1,
              string: '',
              tfilter: 0
            }
          },
          merge: true,
          theme: 'square',
          usage: true,
          verbose: true,
          wiki: {
            intro: true
          },
          wolf: {
            assu: '',
            async: false,
            date: {
              interval: 'month',
              limit: 2000,
              remain: 2000,
              stamp: ''
            },
            expod: '',
            fetch: true,
            fmt: '',
            ftime: 8,
            icase: false,
            incpod: '',
            loc: '',
            pdtime: '',
            podid: '',
            podt: '',
            prtime: 5,
            reint: false,
            scan: '',
            sig: '',
            stime: 3,
            trans: false,
            unit: '',
            width: ''
          },
          wunder: {
            bestf: true,
            date: {
              dinterval: 'day',
              minterval: 'minute',
              dlimit: 500,
              mlimit: 10,
              dremain: 500,
              mremain: 10,
              dstamp: '',
              mstamp: ''
            },
            features: 'conditions,forecast',
            lang: 'EN',
            limit: 5,
            metric: false,
            pws: true
          }
        }
        config.wolf.date.stamp = ''
        config.wolf.date.remain = 2000
        config.wunder.date.dstamp = ''
        config.wunder.date.dremain = 500
        config.wunder.date.mstamp = ''
        config.wunder.date.mremain = 10
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Created [a-z\/\.]*/mig)
        expect(config).to.deep.equal(obj)
        done(err)
      })
    })
    it('force overwrites existing and prints config', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js config init -fv > test/output/config-init.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-init.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 /.[]:-\s|]*/mig)
        done(err)
      })
    })
  })
  describe('get', () => {
    it('shows value of option wiki.intro', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js config get wiki.intro > test/output/config-get.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-get.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Option wiki.intro is (true|false)\./mig)
        done(err)
      })
    })
  })
  describe('set', () => {
    it('sets value of option wiki.intro to false', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js config set wiki.intro false > test/output/config-set.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-set.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Set option wiki.intro to (true|false)\./mig)
        done(err)
      })
    })
    it('enforces hardcoded date', (done) => {
      try {
        child.exec(`node ${process.cwd()}/bin/leximaven.js config set onelook.date false`, (err) => {})
      } catch (e) {
        console.log(e)
      }
      done()
    })
  })
})

describe('root commands', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    const obj = noon.load(TFILE)
    obj.wolf.date.stamp = new Date().toJSON()
    obj.wunder.date.dstamp = new Date().toJSON()
    obj.wunder.date.mstamp = new Date().toJSON()
    let fileExists = null
    try {
      fs.statSync(CFILE)
      fileExists = true
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false
      }
    }
    if (fileExists) {
      const config = noon.load(CFILE)
      obj.wolf.date.stamp = config.wolf.date.stamp
      obj.wolf.date.remain = config.wolf.date.remain
      obj.wunder.date.dstamp = config.wunder.date.dstamp
      obj.wunder.date.dremain = config.wunder.date.dremain
      obj.wunder.date.mstamp = config.wunder.date.mstamp
      obj.wunder.date.mremain = config.wunder.date.mremain
      fs.copySync(CFILE, 'test/output/saved.config.noon')
      noon.save(CFILE, obj)
    } else {
      noon.save(CFILE, obj)
    }
    done()
  })
  after((done) => {
    let fileExists = null
    try {
      fs.statSync('test/output/saved.config.noon')
      fileExists = true
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE)
      fs.copySync('test/output/saved.config.noon', CFILE)
    } else {
      fs.removeSync(CFILE)
    }
    fs.removeSync('test/output')
    done()
  })
  describe('comp', () => {
    it('outputs shell completion script', (done) => {
      child.exec(`node ${__dirname}/../bin/iloa.js comp > test/output/comp.out`, (err) => {
        const stdout = fs.readFileSync('test/output/comp.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 #-.:/>~_{}[\]="@;\s]*/mig)
        done(err)
      })
    })
  })
  describe('help', () => {
    it('shows usage', (done) => {
      child.exec(`node ${__dirname}/../bin/iloa.js --help > test/output/help.out`, (err) => {
        const stdout = fs.readFileSync('test/output/help.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[#\-a-z0-9\.\s:\/>~_\(\)\{\}\[\]="$@,; ]*/mig)
        done(err)
      })
    })
  })
  describe('ls', () => {
    it('demonstrates installed themes', (done) => {
      child.exec(`node ${__dirname}/../bin/iloa.js ls > test/output/ls.out`, (err) => {
        const stdout = fs.readFileSync('test/output/ls.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z:|, .<>\-[\]→\s]*/mig)
        done(err)
      })
    })
  })
  describe('duckduckgo', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js dg -o ${process.cwd()}/test/output/ddg.json nodejs > test/output/ddg.out`, (err) => {
        const stdout = fs.readFileSync('test/output/ddg.out', 'utf8')
        const obj = {
          type: 'duckduckgo',
          source: 'https://www.duckduckgo.com/',
          url: 'https://api.duckduckgo.com/?q=nodejs&format=json&pretty=1&no_redirect=1&no_html=1&t=iloa',
          answerType: '',
          responseType: 'Article',
          title: 'Node.js',
          entity: 'software',
          abstractSource: 'Wikipedia',
          abstractUrl: 'https://en.wikipedia.org/wiki/Node.js',
          text: "Node.js is an open-source, cross-platform JavaScript runtime environment for developing a diverse variety of tools and applications. Although Node.js is not a JavaScript framework, many of its basic modules are written in JavaScript, and developers can write new modules in JavaScript. The runtime environment interprets JavaScript using Google's V8 JavaScript engine.",
          image: 'https://duckduckgo.com/i/a65969b4.png',
          relatedText0: 'MEAN (software bundle) - MEAN is a free and open-source JavaScript software stack for building dynamic web sites and web applications.',
          relatedUrl0: 'https://duckduckgo.com/MEAN_(software_bundle)',
          relatedText1: 'Rhino (JavaScript engine) - Rhino is a JavaScript engine written fully in Java and managed by the Mozilla Foundation as open source software. It is separate from the SpiderMonkey engine, which is also developed by Mozilla, but written in C++ and used in Mozilla Firefox.',
          relatedUrl1: 'https://duckduckgo.com/Rhino_(JavaScript_engine)',
          relatedText2: 'Linux Foundation projects',
          relatedUrl2: 'https://duckduckgo.com/c/Linux_Foundation_projects',
          relatedText3: 'Free software programmed in JavaScript',
          relatedUrl3: 'https://duckduckgo.com/c/Free_software_programmed_in_JavaScript',
          relatedText4: 'Joyent',
          relatedUrl4: 'https://duckduckgo.com/c/Joyent',
          relatedText5: 'JavaScript libraries',
          relatedUrl5: 'https://duckduckgo.com/c/JavaScript_libraries',
          relatedText6: 'Software using the MIT license',
          relatedUrl6: 'https://duckduckgo.com/c/Software_using_the_MIT_license',
          relatedText7: 'Free software programmed in C++',
          relatedUrl7: 'https://duckduckgo.com/c/Free_software_programmed_in_C%2B%2B'
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/ddg.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 [\]→\s.:\/\-,'()_+%]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
    it('shows categories', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js dg 'The Simpsons characters' -o test/output/categories.json > test/output/categories.out`, (err) => {
        const stdout = fs.readFileSync('test/output/categories.out', 'utf8')
        const json = fs.readJsonSync(`${process.cwd()}/test/output/categories.json`)
        const obj = {
          type: 'duckduckgo',
          source: 'https://www.duckduckgo.com/',
          url: 'https://api.duckduckgo.com/?q=The%20Simpsons%20characters&format=json&pretty=1&no_redirect=1&no_html=1&t=iloa',
          answerType: '',
          responseType: 'Category',
          title: 'The Simpsons characters',
          abstractSource: 'Wikipedia',
          abstractUrl: 'https://en.wikipedia.org/wiki/The_Simpsons_characters',
          relatedText0: "Apu Nahasapeemapetilon - Apu Nahasapeemapetilon is a cartoon character in the animated television series The Simpsons. He is the Indian immigrant proprietor of the Kwik-E-Mart, a popular convenience store in Springfield, and is well known for his catchphrase, \"Thank you, come again.\"",
          relatedUrl0: 'https://duckduckgo.com/Apu_Nahasapeemapetilon',
          relatedText1: "Barney Gumble - Barnard \"Barney\" Gumble is a fictional character on the American animated sitcom The Simpsons. The character is voiced by Dan Castellaneta and first appeared in the series premiere episode \"Simpsons Roasting on an Open Fire\".",
          relatedUrl1: 'https://duckduckgo.com/Barney_Gumble',
          relatedText2: "Bart Simpson - Bartholomew JoJo \"Bart\" Simpson is a fictional character in the American animated television series The Simpsons and part of the Simpson family. He is voiced by Nancy Cartwright and first appeared on television in The Tracey Ullman Show short \"Good Night\" on April 19, 1987.",
          relatedUrl2: 'https://duckduckgo.com/Bart_Simpson',
          relatedText3: "Chief Wiggum - Chief Chauncey \"Clancy\" Wiggum is a fictional character from the animated television series The Simpsons, voiced by Hank Azaria. He is the chief of police in the show's setting of Springfield. He is the father of Ralph Wiggum and the husband of Sarah Wiggum.",
          relatedUrl3: 'https://duckduckgo.com/Chief_Wiggum',
          relatedText4: "Cletus Spuckler - Cletus Delroy Spuckler, commonly called Cletus the Slack-Jawed Yokel is a recurring character in the Fox animated series The Simpsons, voiced by Hank Azaria. Cletus is Springfield's resident hillbilly stereotype. He is usually portrayed wearing a white sleeveless shirt and blue jeans.",
          relatedUrl4: 'https://duckduckgo.com/Cletus_Spuckler',
          relatedText5: "Comic Book Guy - Comic Book Guy is the common, popular name for Jeffrey \"Jeff\" Albertson, a recurring fictional character in the animated television series The Simpsons. He is voiced by Hank Azaria and first appeared in the second-season episode \"Three Men and a Comic Book\", which originally aired on May 9, 1991.",
          relatedUrl5: 'https://duckduckgo.com/Comic_Book_Guy',
          relatedText6: "Dr. Hibbert - Dr. Julius M. Hibbert, usually referred to as Dr. Hibbert, is a recurring character on the animated series The Simpsons. His speaking voice is provided by Harry Shearer and his singing voice was by Thurl Ravenscroft, and he first appeared in the episode \"Bart the Daredevil\".",
          relatedUrl6: "https://duckduckgo.com/Dr._Hibbert",
          relatedText7: "Dr. Nick - Dr. Nicholas Riviera is a recurring fictional character in the American animated sitcom The Simpsons. He is voiced by Hank Azaria and first appeared in the episode \"Bart Gets Hit by a Car\". Dr. Nick is an inept quack physician, and a satire of incompetent medical professionals.",
          relatedUrl7: 'https://duckduckgo.com/Dr._Nick',
          relatedText8: "Edna Krabappel - Edna Krabappel was a cartoon character from the animated television series The Simpsons, who was voiced by Marcia Wallace until her death in 2013. She is the teacher of Bart Simpson's 4th grade class at Springfield Elementary School, and Ned Flanders's wife in later seasons.",
          relatedUrl8: 'https://duckduckgo.com/Edna_Krabappel',
          relatedText9: "Fat Tony (The Simpsons) - Marion Anthony \"Fat Tony\" D'Amico is a recurring character in the animated sitcom The Simpsons. He is voiced by Joe Mantegna and first appeared in the third season episode \"Bart the Murderer\". Fat Tony is a gangster and the underboss of the Springfield Mafia.",
          relatedUrl9: 'https://duckduckgo.com/Fat_Tony_(The_Simpsons)',
          relatedText10: "Grampa Simpson - Abraham Jedediah \"Abe\" Simpson II, often known simply as Grampa, is a fictional character in the animated television series, The Simpsons, he made his first appearance in the episode entitled Grampa and the Kids, a Simpsons short on The Tracey Ullman Show.",
          relatedUrl10: 'https://duckduckgo.com/Grampa_Simpson',
          relatedText11: "Groundskeeper Willie - William MacDougal, more commonly known as Groundskeeper Willie, is a recurring character on The Simpsons, voiced by Dan Castellaneta. He is head groundskeeper at Springfield Elementary School. Willie is almost feral in nature and is immensely proud of his native Scotland.",
          relatedUrl11: 'https://duckduckgo.com/Groundskeeper_Willie',
          relatedText12: "Hans Moleman - Hans Moleman is a recurring character on the animated television series The Simpsons. He was created by series creator Matt Groening and is voiced by Dan Castellaneta, and first appeared in the episode \"Principal Charming\".",
          relatedUrl12: 'https://duckduckgo.com/Hans_Moleman',
          relatedText13: "Homer Simpson - Homer Jay Simpson is a fictional character and the main protagonist of the American animated television series The Simpsons as the patriarch of the eponymous family.",
          relatedUrl13: 'https://duckduckgo.com/Homer_Simpson',
          relatedText14: "Kang and Kodos - Kang and Kodos are a duo of recurring characters in the animated television series The Simpsons. Kang is voiced by Harry Shearer and Kodos by Dan Castellaneta. They are aliens from the fictional planet Rigel VII and appear almost exclusively in the \"Treehouse of Horror\" episodes.",
          relatedUrl14: 'https://duckduckgo.com/Kang_and_Kodos',
          relatedText15: "Kent Brockman - Kent Brockman is a fictional character in the animated television series The Simpsons. He is voiced by Harry Shearer and first appeared in the episode \"Krusty Gets Busted\". He is a grumpy, self-centered local Springfield news anchor.",
          relatedUrl15: 'https://duckduckgo.com/Kent_Brockman',
          relatedText16: "Krusty the Clown - Herschel Shmoikel Pinchas Yerucham Krustofsky, better known as Krusty the Clown, is a cartoon character in the animated television series The Simpsons. He is voiced by Dan Castellaneta.",
          relatedUrl16: 'https://duckduckgo.com/Krusty_the_Clown',
          relatedText17: "Lenny and Carl - Lenford \"Lenny\" Leonard and Carlton \"Carl\" Carlson are two supporting characters in the Fox animated series The Simpsons, voiced by Harry Shearer and Hank Azaria, respectively. They are best friends of Homer Simpson and work with him at the Springfield Nuclear Power Plant.",
          relatedUrl17: 'https://duckduckgo.com/Lenny_and_Carl',
          relatedText18: "Lionel Hutz - Lionel Hutz is a fictional character in the animated television series The Simpsons. He was voiced by Phil Hartman, and his first appearance was in the season two episode \"Bart Gets Hit by a Car\".",
          relatedUrl18: 'https://duckduckgo.com/Lionel_Hutz',
          relatedText19: "Lisa Simpson - Lisa Marie Simpson is a fictional character in the animated television series The Simpsons. She is the middle child and most intelligent of the Simpson family. Voiced by Yeardley Smith, Lisa first appeared on television in The Tracey Ullman Show short \"Good Night\" on April 19, 1987.",
          relatedUrl19: 'https://duckduckgo.com/Lisa_Simpson',
          relatedText20: "Maggie Simpson - Margaret \"Maggie\" Evelyn Simpson is a fictional character in the animated television series The Simpsons. She first appeared on television in the Tracey Ullman Show short \"Good Night\" on April 19, 1987.",
          relatedUrl20: 'https://duckduckgo.com/Maggie_Simpson',
          relatedText21: "Marge Simpson - Marjorie Jacqueline \"Marge\" Simpson is a fictional character in the American animated sitcom The Simpsons and part of the eponymous family. She is voiced by Julie Kavner and first appeared on television in The Tracey Ullman Show short \"Good Night\" on April 19, 1987.",
          relatedUrl21: 'https://duckduckgo.com/Marge_Simpson',
          relatedText22: "Mayor Quimby - Mayor Joseph \"Joe\" Quimby, nicknamed \"Diamond Joe\", is a recurring character from the animated television series The Simpsons. He is voiced by Dan Castellaneta, and first appeared in the episode \"Bart Gets an F\".",
          relatedUrl22: 'https://duckduckgo.com/Mayor_Quimby',
          relatedText23: "Milhouse Van Houten - Milhouse Mussolini van Houten is a fictional character featured in the animated television series The Simpsons, voiced by Pamela Hayden, and created by Matt Groening.",
          relatedUrl23: 'https://duckduckgo.com/Milhouse_Van_Houten',
          relatedText24: "Moe Szyslak - Moammar \"Moe\" Szyslak is a fictional character from the American animated television series, The Simpsons. He is voiced by Hank Azaria and first appeared in the series premiere episode \"Simpsons Roasting on an Open Fire\".",
          relatedUrl24: 'https://duckduckgo.com/Moe_Szyslak',
          relatedText25: "Mona Simpson (The Simpsons) - Mona J. Simpson is a recurring fictional character in the animated television series The Simpsons. She has been voiced by several actresses, including Maggie Roswell, Tress MacNeille, Pamela Hayden, and most prominently, Glenn Close.",
          relatedUrl25: 'https://duckduckgo.com/Mona_Simpson_(The_Simpsons)',
          relatedText26: "Mr. Burns - Charles Montgomery Burns, known as C. Montgomery Burns and Monty Burns, but usually referred to simply as Mr. Burns, is a recurring character in the animated television series The Simpsons, and is voiced by Harry Shearer.",
          relatedUrl26: 'https://duckduckgo.com/Mr._Burns',
          relatedText27: "Ned Flanders - Nedward \"Ned\" Flanders, Jr. is a recurring fictional character in the animated television series The Simpsons. He is voiced by Harry Shearer, and first appeared in the series premiere episode \"Simpsons Roasting on an Open Fire\".",
          relatedUrl27: 'https://duckduckgo.com/Ned_Flanders',
          relatedText28: "Nelson Muntz - Nelson Mandela Muntz is a fictional character and the lead school bully from the animated TV series The Simpsons. He is voiced by Nancy Cartwright. Nelson was introduced in Season 1's \"Bart the General\" as an antagonist but later turned into one of Bart Simpson's best friends.",
          relatedUrl28: 'https://duckduckgo.com/Nelson_Muntz',
          relatedText29: "Otto Mann - Otto Mann is a fictional character on the animated TV series The Simpsons, voiced by Harry Shearer. He is the school bus driver for Springfield Elementary School.",
          relatedUrl29: 'https://duckduckgo.com/Otto_Mann',
          relatedText30: "Patty and Selma - Patty and Selma Bouvier are fictional characters in the American animated sitcom The Simpsons. They are identical twins and are both voiced by Julie Kavner.",
          relatedUrl30: 'https://duckduckgo.com/Patty_and_Selma',
          relatedText31: "Principal Skinner - Principal W. Seymour Skinner is a fictional character in the American animated sitcom The Simpsons, who is voiced by Harry Shearer.",
          relatedUrl31: 'https://duckduckgo.com/Principal_Skinner',
          relatedText32: "Professor Frink - Professor John Nerdelbaum Frink, Jr., or simply Professor Frink, is a recurring character in the animated television series The Simpsons. He is voiced by Hank Azaria, and first appeared in the 1991 episode \"Old Money\".",
          relatedUrl32: 'https://duckduckgo.com/Professor_Frink',
          relatedText33: "Ralph Wiggum - Ralph Wiggum is a recurring character on the animated series The Simpsons, voiced by Nancy Cartwright. The son of Police Chief Wiggum and a classmate of Lisa Simpson, Ralph is best known as the show's resident oddball, and is noted for his non sequiturs and erratic behavior.",
          relatedUrl33: 'https://duckduckgo.com/Ralph_Wiggum',
          relatedText34: "Reverend Lovejoy - Reverend Timothy \"Tim\" Lovejoy is a recurring character in the animated television series The Simpsons. He is voiced by Harry Shearer, and first appeared in the episode \"The Telltale Head\". Lovejoy is the minister at The First Church of Springfield—the Protestant church in Springfield.",
          relatedUrl34: 'https://duckduckgo.com/Reverend_Lovejoy',
          relatedText35: "Santa's Little Helper - Santa's Little Helper is a recurring character in the American animated television series The Simpsons. He is the pet greyhound of the Simpson family.",
          relatedUrl35: "https://duckduckgo.com/Santa's_Little_Helper",
          relatedText36: "Sideshow Bob - Dr. Robert Underdunk Terwilliger. Jr Doctor of Philosophy, better known as Sideshow Bob, is a recurring character in the animated television series The Simpsons. He is voiced by Kelsey Grammer and first appeared briefly in the episode \"The Telltale Head\".",
          relatedUrl36: 'https://duckduckgo.com/Sideshow_Bob',
          relatedText37: "Simpson family - The Simpson family are cartoon characters featured in the animated television series The Simpsons. The Simpsons are a nuclear family consisting of married couple Homer and Marge and their three children Bart, Lisa and Maggie.",
          relatedUrl37: 'https://duckduckgo.com/Simpson_family',
          relatedText38: "Snake Jailbird - Snake Jailbird is a recurring fictional character in the animated television series The Simpsons, who is voiced by Hank Azaria. Snake's first appearance was in the episode \"The War of the Simpsons\". His catchphrase is \"Bye! \", which he usually says when he's in trouble.",
          relatedUrl38: 'https://duckduckgo.com/Snake_Jailbird',
          relatedText39: "The Itchy & Scratchy Show - The Itchy & Scratchy Show is a running gag and fictional animated television series featured in the animated television series The Simpsons. It usually appears as a part of The Krusty the Clown Show, watched regularly by Bart and Lisa Simpson.",
          relatedUrl39: 'https://duckduckgo.com/The_Itchy_%26_Scratchy_Show',
          relatedText40: "Troy McClure - Troy McClure is a fictional character from the American animated sitcom The Simpsons. He was voiced by Phil Hartman and first appeared in the second season episode \"Homer vs. Lisa and the 8th Commandment\".",
          relatedUrl40: 'https://duckduckgo.com/Troy_McClure',
          relatedText41: "Waylon Smithers - Waylon J. Smithers, Jr., usually referred to as Mr. Smithers or simply Smithers, is a recurring fictional character in the American animated sitcom The Simpsons, who is voiced by Harry Shearer.",
          relatedUrl41: 'https://duckduckgo.com/Waylon_Smithers'
        }
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s\[\]→:\/\._\-,"'\(\)—!&%]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
    it('shows topic summaries', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js dg 'Valley Forge National Historical Park' -o test/output/topic-summaries.json > test/output/topic-summaries.out`, (err) => {
        done(err)
      })
    })
    it('shows disambiguation', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js dg 'apple' -o test/output/disambiguation.json > test/output/disambiguation.out`, (err) => {
        const stdout = fs.readFileSync('test/output/disambiguation.out', 'utf8')
        const json = fs.readJsonSync(`${process.cwd()}/test/output/disambiguation.json`)
        const obj = {
          "type": "duckduckgo",
          "source": "https://www.duckduckgo.com/",
          "url": "https://api.duckduckgo.com/?q=apple&format=json&pretty=1&no_redirect=1&no_html=1&t=iloa",
          "answerType": "",
          "responseType": "Disambiguation",
          "title": "Apple",
          "abstractSource": "Wikipedia",
          "abstractUrl": "https://en.wikipedia.org/wiki/Apple_(disambiguation)",
          "relatedText0": "Apple A deciduous tree in the rose family best known for its sweet, pomaceous fruit, the apple.",
          "relatedUrl0": "https://duckduckgo.com/Apple",
          "relatedText1": "Apple Inc. An American multinational technology company headquartered in Cupertino, California, that designs...",
          "relatedUrl1": "https://duckduckgo.com/Apple_Inc.",
          "relatedText2": "Apple I A desktop computer released by the Apple Computer Company in 1976.",
          "relatedUrl2": "https://duckduckgo.com/Apple_I",
          "topicName0": "Botany",
          "topicText0": "Hedge apple A small deciduous tree or large shrub, typically growing to tall.",
          "topicUrl0": "https://duckduckgo.com/Maclura_pomifera",
          "topicName1": "Companies",
          "topicText1": "Apple Leisure Group A vertically-integrated travel and hospitality conglomerate focused on packaged travel and...",
          "topicUrl1": "https://duckduckgo.com/Apple_Leisure_Group",
          "topicName2": "Film and television",
          "topicText2": "\"The Apple\" (Star Trek: The Original Series) \"The Apple\" is episode No. 34, production No. 38, of the second season of the original science...",
          "topicUrl2": "https://duckduckgo.com/The_Apple_(Star_Trek%3A_The_Original_Series)",
          "topicName3": "Music",
          "topicText3": "Apple (album) The only full-length studio album by the American alternative rock band Mother Love Bone.",
          "topicUrl3": "https://duckduckgo.com/Apple_(album)",
          "topicName4": "Places",
          "topicText4": "Apple Creek (stream), Missouri A stream that rises in western Perry County, Missouri and empties into the Mississippi River...",
          "topicUrl4": "https://duckduckgo.com/Apple_Creek_(stream)%2C_Missouri",
          "topicName5": "Technology",
          "topicText5": "Apple Pugetsound Program Library Exchange A.P.P.L.E., also known as Apple Pugetsound Program Library Exchange was initially established in...",
          "topicUrl5": "https://duckduckgo.com/Apple_Pugetsound_Program_Library_Exchange",
          "topicName6": "Politics",
          "topicText6": "Yabloko A political party in Russia founded in 1993.",
          "topicUrl6": "https://duckduckgo.com/Yabloko",
          "topicName7": "Other uses",
          "topicText7": "Apples (novel) The bestselling debut novel by Richard Milward, published in 2007.",
          "topicUrl7": "https://duckduckgo.com/Apples_(novel)",
          "topicName8": "See also",
          "topicText8": "Big Apple Meanings See related meanings for the phrase 'Big Apple'.",
          "topicUrl8": "https://duckduckgo.com/d/Big_Apple"
        }
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s\[\]→:\/\._\(\),–\-"%']*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
    it('shows bangs', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js dg '!songmeanings Tool' > test/output/bangs.out`, (err) => {
        const stdout = fs.readFileSync('test/output/bangs.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s\[\]!:\/\.?=]*/mig)
        done(err)
      })
    })
    it('shows calculations', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js dg '1 % 3' > test/output/calculations.out`, (err) => {
        const stdout = fs.readFileSync('test/output/calculations.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \[\]\s→%=]*/mig)
        done(err)
      })
    })
    it('shows phone numbers', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js dg '407-934-7639' > test/output/phone-numbers.out`, (err) => {
        const stdout = fs.readFileSync('test/output/phone-numbers.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \[\]\s\-\(\)→%=]*/mig)
        done(err)
      })
    })
  })
  describe('wolfram|alpha', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js wa -o ${process.cwd()}/test/output/wa.json 'doppler shift' > test/output/wa.out`, (err) => {
        const stdout = fs.readFileSync('test/output/wa.out', 'utf8')
        const obj = {
          type: 'wolfram-alpha',
          source: 'http://www.wolframalpha.com/',
          pod0: {
            title: 'Input interpretation',
            scanner: 'Formula',
            subpods: 1,
            position: 100,
            subpod0: {
              text: 'Doppler shift',
              image: ''
            }
          },
          pod1: {
            title: 'Equation',
            scanner: 'Formula',
            subpods: 1,
            position: 200,
            subpod0: {
              text: 'f_o/f_s = c/(c + v_s) |  \nf_o/f_s | frequency reduction factor\nv_s | speed of the source away from the observer\nc | sound speed\n(the ratio between emitted and observed sound frequencies due to relative motion)',
              image: ''
            }
          },
          pod2: {
            title: 'Input values',
            scanner: 'Formula',
            subpods: 1,
            position: 300,
            subpod0: {
              text: 'speed of the source away from the observer | 10 m/s  (meters per second)\nsound speed | 340.3 m/s  (meters per second)',
              image: ''
            }
          },
          pod3: {
            title: 'Result',
            scanner: 'Formula',
            subpods: 1,
            position: 400,
            subpod0: {
              text: 'frequency reduction factor | 0.9715',
              image: ''
            }
          },
          pod4: {
            title: 'Audible frequencies',
            scanner: 'Formula',
            subpods: 1,
            position: 500,
            subpod0: {
              text: 'source: 1  |  observed: 0.9715',
              image: ''
            }
          },
          assumption0: {
            type: 'Clash',
            clash: 'Assuming doppler shift is a formula. Use a physical quantity instead.'
          },
          assumption1: {
            type: 'FormulaSolve',
            'frequency reduction factor': '*FS-_**DopplerShift.DopplerRatio--',
            'speed of the source away from the observer': '*FS-_**DopplerShift.vs--',
            'sound speed': '*FS-_**DopplerShift.c--'
          },
          assumption2: {
            type: 'FormulaSelect',
            formulaSelect: 'Assuming Doppler shift. Use relativistic Doppler shift instead.'
          },
          assumption3: {
            type: 'FormulaVariable',
            'speed of the source away from the observer': '10 m/s'
          },
          assumption4: {
            type: 'FormulaVariable',
            'sound speed': '340.3 m/s'
          },
          assumption5: {
            type: 'FormulaVariableOption',
            formulaVariableOption: 'Assuming frequency reduction factor. Use frequency observed and frequency at the source instead.'
          },
          assumption6: {
            type: 'FormulaVariableInclude',
            formulaVariableInclude: 'speed of the observer'
          }
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/wa.json`)
        json.pod0.subpod0.image = ''
        json.pod1.subpod0.image = ''
        json.pod2.subpod0.image = ''
        json.pod3.subpod0.image = ''
        json.pod4.subpod0.image = ''
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9[\]\s→|:/.?=&_()+*\-,]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('wikipedia', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js wp -i --verbose=false -o ${process.cwd()}/test/output/wp.json 'George Gurdjieff' > test/output/wp.out`, (err) => {
        const stdout = fs.readFileSync('test/output/wp.out', 'utf8')
        const obj = {
          type: 'wiki',
          source: 'http://www.wikipedia.org/',
          url: 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&indexpageids&redirects=1&continue=&explaintext=&exintro=&titles=George%20Gurdjieff',
          summary: `George Ivanovich Gurdjieff (/ˈɡɜːrdʒiˌɛf/; January 13, 1866/1872/1877? – October 29, 1949), also commonly referred to as Georges Ivanovich Gurdjieff and G. I. Gurdjieff, was an influential early 20th-century mystic, philosopher, spiritual teacher, and composer born in what was then an Armenian region of Russia of Armenian and Greek descent. Gurdjieff taught that most humans do not possess a unified mind-body consciousness and thus live their lives in a state of hypnotic \"waking sleep\", but that it is possible to transcend to a higher state of consciousness and achieve full human potential. Gurdjieff described a method attempting to do so, calling the discipline \"The Work\" (connoting \"work on oneself\") or \"the Method\". According to his principles and instructions,\nGurdjieff's method for awakening one's consciousness unites the methods of the fakir, monk or yogi, and thus he referred to it as the \"Fourth Way\".`
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/wp.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s(\/ˈɡɜ:ˈʒˌɛ;?–\),\.\-"'=Гео́ргийва́новичурджΓεώργιοςωργιάδηԳեորգիԳյուրջիևἸνéâ—$\[\]’ü&]*/mig)
        // expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('weather-underground', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js wu -e alerts,almanac,astronomy,conditions,forecast,geolookup,hourly,tide,webcams -l 1 33706 > test/output/wu.out`, (err) => {
        const stdout = fs.readFileSync('test/output/wu.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s[\]→.:,*\-/>%()_?=]*/mig)
        done(err)
      })
    })
  })
  describe('version', () => {
    it('prints the version number', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js --version`, (err, stdout) => {
        expect(stdout).to.contain(version)
        done(err)
      })
    })
  })
})

describe('encyclopedia-of-life', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  describe('collect', (done) => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js eol collect -o ${process.cwd()}/test/output/eol-collect.json -e 1 176 > test/output/eol-collect.out`, (err) => {
        const stdout = fs.readFileSync('test/output/eol-collect.out', 'utf8')
        const obj = {
          type: 'collections',
          source: 'http://eol.org',
          collections: {
            total_items: 200049,
            name: 'EOL Group on Flickr',
            description: 'This group allows anyone to provide images and videos for the Encyclopedia of Life web site. Contributors tag their images for EOL use and select a creative commons license that allows reuse at least for non-commercial purpose. The EOL harvester checks the group every couple of days, imports new photos and updates records if any of the data (tags, descriptions, licenses) have changed. Last indexed May 20, 2015',
            logo_url: 'http://media.eol.org/content/2011/08/30/11/95200_130_130.jpg',
            item_type0: 'TaxonConcept',
            item_count0: 49,
            item_type1: 'Text',
            item_count1: 0,
            item_type2: 'Video',
            item_count2: 1730,
            item_type3: 'Image',
            item_count3: 198270,
            item_type4: 'Sound',
            item_count4: 0,
            item_type5: 'Community',
            item_count5: 0,
            item_type6: 'User',
            item_count6: 0,
            item_type7: 'Collection',
            item_count7: 0,
            item_name0: 'Salix alba L.',
            item_title0: 'Salix alba',
            object_type0: 'TaxonConcept',
            object_id0: 1264966
          }
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/eol-collect.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s[\]→.\-,():/_]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('entry', (done) => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js eol entry -o ${process.cwd()}/test/output/eol-entry.json 61387754 > test/output/eol-entry.out`, (err) => {
        const stdout = fs.readFileSync('test/output/eol-entry.out', 'utf8')
        const obj = {
          'type': 'entry',
          'src': 'http://eol.org/',
          'sourceIdentifier': '507182',
          'taxonID': 61387754,
          'parentNameUsageID': 61387718,
          'scientificName': 'Sporobolus compositus (Poir.) Merr.',
          'taxonRank': 'Species',
          'source': 'http://eol.org/pages/46698411/hierarchy_entries/61387754/overview',
          'nameAccordingTo': [
            'Integrated Taxonomic Information System (ITIS)'
          ],
          'vernacular': {},
          'synonyms': {},
          'ancestors': {
            'sourceIdentifier0': '202422',
            'taxonID0': 46150613,
            'parentNameUsageID0': 0,
            'taxonConceptID0': 281,
            'scientificName0': 'Plantae',
            'taxonRank0': 'kingdom',
            'source0': 'http://eol.org/pages/281/hierarchy_entries/46150613/overview',
            'sourceIdentifier1': '954898',
            'taxonID1': 61348076,
            'parentNameUsageID1': 46150613,
            'taxonConceptID1': 8654492,
            'scientificName1': 'Viridiplantae',
            'taxonRank1': 'subkingdom',
            'source1': 'http://eol.org/pages/8654492/hierarchy_entries/61348076/overview',
            'sourceIdentifier2': '846494',
            'taxonID2': 61350312,
            'parentNameUsageID2': 61348076,
            'taxonConceptID2': 11823577,
            'scientificName2': 'Streptophyta',
            'taxonRank2': 'infrakingdom',
            'source2': 'http://eol.org/pages/11823577/hierarchy_entries/61350312/overview',
            'sourceIdentifier3': '954900',
            'taxonID3': 61352360,
            'parentNameUsageID3': 61350312,
            'taxonConceptID3': 2913521,
            'scientificName3': 'Embryophyta',
            'taxonRank3': 'superdivision',
            'source3': 'http://eol.org/pages/2913521/hierarchy_entries/61352360/overview',
            'sourceIdentifier4': '846496',
            'taxonID4': 61355912,
            'parentNameUsageID4': 61352360,
            'taxonConceptID4': 4077,
            'scientificName4': 'Tracheophyta',
            'taxonRank4': 'phylum',
            'source4': 'http://eol.org/pages/4077/hierarchy_entries/61355912/overview',
            'sourceIdentifier5': '846504',
            'taxonID5': 61355913,
            'parentNameUsageID5': 61355912,
            'taxonConceptID5': 39715199,
            'scientificName5': 'Spermatophytina',
            'taxonRank5': 'subphylum',
            'source5': 'http://eol.org/pages/39715199/hierarchy_entries/61355913/overview',
            'sourceIdentifier6': '18063',
            'taxonID6': 61356312,
            'parentNameUsageID6': 61355913,
            'taxonConceptID6': 283,
            'scientificName6': 'Magnoliopsida',
            'taxonRank6': 'class',
            'source6': 'http://eol.org/pages/283/hierarchy_entries/61356312/overview',
            'sourceIdentifier7': '846542',
            'taxonID7': 61380387,
            'parentNameUsageID7': 61356312,
            'taxonConceptID7': 28846734,
            'scientificName7': 'Lilianae',
            'taxonRank7': 'superorder',
            'source7': 'http://eol.org/pages/28846734/hierarchy_entries/61380387/overview',
            'sourceIdentifier8': '846620',
            'taxonID8': 61381764,
            'parentNameUsageID8': 61380387,
            'taxonConceptID8': 4075,
            'scientificName8': 'Poales',
            'taxonRank8': 'order',
            'source8': 'http://eol.org/pages/4075/hierarchy_entries/61381764/overview',
            'sourceIdentifier9': '40351',
            'taxonID9': 61383384,
            'parentNameUsageID9': 61381764,
            'taxonConceptID9': 8223,
            'scientificName9': 'Poaceae',
            'taxonRank9': 'family',
            'source9': 'http://eol.org/pages/8223/hierarchy_entries/61383384/overview',
            'sourceIdentifier10': '42115',
            'taxonID10': 61387718,
            'parentNameUsageID10': 61383384,
            'taxonConceptID10': 108217,
            'scientificName10': 'Sporobolus R. Br.',
            'taxonRank10': 'genus',
            'source10': 'http://eol.org/pages/108217/hierarchy_entries/61387718/overview'
          },
          'children': {
            'sourceIdentifier0': '531124',
            'taxonID0': 61387755,
            'parentNameUsageID0': 61387754,
            'taxonConceptID0': 1294248,
            'scientificName0': 'Sporobolus compositus var. compositus (Poir.) Merr.',
            'taxonRank0': 'variety',
            'source0': 'http://eol.org/pages/1294248/hierarchy_entries/61387755/overview',
            'sourceIdentifier1': '531125',
            'taxonID1': 61387756,
            'parentNameUsageID1': 61387754,
            'taxonConceptID1': 44043852,
            'scientificName1': 'Sporobolus compositus var. drummondii (Trin.) Kartesz & Gandhi',
            'taxonRank1': 'variety',
            'source1': 'http://eol.org/pages/44043852/hierarchy_entries/61387756/overview',
            'sourceIdentifier2': '531126',
            'taxonID2': 61387757,
            'parentNameUsageID2': 61387754,
            'taxonConceptID2': 1294250,
            'scientificName2': 'Sporobolus compositus var. macer (Trin.) Kartesz & Gandhi',
            'taxonRank2': 'variety',
            'source2': 'http://eol.org/pages/1294250/hierarchy_entries/61387757/overview'
          }
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/eol-entry.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s[\]→.\-,():/_&]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('hier', (done) => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js eol hier -o ${process.cwd()}/test/output/eol-hier.json 1188 > test/output/eol-hier.out`, (err) => {
        const stdout = fs.readFileSync('test/output/eol-hier.out', 'utf8')
        const obj = {
          type: 'hierarchies',
          source: 'http://eol.org',
          title: 'Species 2000 & ITIS Catalogue of Life: April 2013',
          contributor: 'Catalogue of Life',
          dateSubmitted: '2013-03-30 19:53:45',
          roots: {
            parentNameUsageID0: 0,
            scientificName0: 'Animalia',
            taxonID0: 51521761,
            sourceIdentifier0: '13021388',
            taxonRank0: 'kingdom',
            parentNameUsageID1: 0,
            scientificName1: 'Fungi',
            taxonID1: 52744048,
            sourceIdentifier1: '13021511',
            taxonRank1: 'kingdom',
            parentNameUsageID2: 0,
            scientificName2: 'Plantae',
            taxonID2: 52800975,
            sourceIdentifier2: '13021533',
            taxonRank2: 'kingdom',
            parentNameUsageID3: 0,
            scientificName3: 'Bacteria',
            taxonID3: 53103686,
            sourceIdentifier3: '13021538',
            taxonRank3: 'kingdom',
            parentNameUsageID4: 0,
            scientificName4: 'Chromista',
            taxonID4: 53112249,
            sourceIdentifier4: '13021719',
            taxonRank4: 'kingdom',
            parentNameUsageID5: 0,
            scientificName5: 'Viruses',
            taxonID5: 53114002,
            sourceIdentifier5: '13023715',
            taxonRank5: 'kingdom',
            parentNameUsageID6: 0,
            scientificName6: 'Protozoa',
            taxonID6: 53116999,
            sourceIdentifier6: '13023992',
            taxonRank6: 'kingdom',
            parentNameUsageID7: 0,
            scientificName7: 'Archaea',
            taxonID7: 53131235,
            sourceIdentifier7: '13025806',
            taxonRank7: 'kingdom'
          }
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/eol-hier.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s[\]→.\-,():/_&]*s/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('info', (done) => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js eol info > test/output/eol-info.out`, (err) => {
        const stdout = fs.readFileSync('test/output/eol-info.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s[\]→.\-,():/_&]*/mig)
        done(err)
      })
    })
  })
  describe('meta', (done) => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js eol meta -o ${process.cwd()}/test/output/eol-meta.json 30073527 > test/output/eol-meta.out`, (err) => {
        const stdout = fs.readFileSync('test/output/eol-meta.out', 'utf8')
        const obj = {
          type: 'metadata',
          source: 'http://eol.org',
          metadata: {
            id: 1045608,
            scientificName: 'Apis mellifera Linnaeus 1758',
            richness_score: 400
          },
          dataObjects: {
            'id0': 52191458,
            'scientificName0': 'Apis mellifera Linnaeus 1758',
            'accordingTo0': 'Species 2000 & ITIS Catalogue of Life: April 2013',
            'canonical0': 'Apis mellifera',
            'sourceIdentifier0': '6845885',
            'taxonRank0': 'Species',
            'id1': 59534038,
            'scientificName1': 'Apis (Apis) mellifera Linnaeus 1758',
            'accordingTo1': 'Paleobiology Database',
            'canonical1': 'Apis mellifera',
            'sourceIdentifier1': '235173',
            'taxonRank1': 'Species',
            'id2': 49121298,
            'scientificName2': 'Apis (Apis) mellifera Linnaeus 1758',
            'accordingTo2': 'Paleobiology Database',
            'canonical2': 'Apis mellifera',
            'sourceIdentifier2': 'urn:paleodb:tn235173',
            'taxonRank2': 'Species',
            'id3': 49379619,
            'scientificName3': 'Apis (Apis) mellifera Linnaeus 1758',
            'accordingTo3': 'Paleobiology Database',
            'canonical3': 'Apis mellifera',
            'sourceIdentifier3': 'urn:paleodb:tn235173',
            'taxonRank3': 'Species',
            'id4': 55789671,
            'scientificName4': 'Apis mellifera Linnaeus 1758',
            'accordingTo4': 'Integrated Taxonomic Information System (ITIS)',
            'canonical4': 'Apis mellifera',
            'sourceIdentifier4': '154396',
            'taxonRank4': 'Species',
            'id5': 59631096,
            'scientificName5': 'Apis mellifera Linnaeus 1758',
            'accordingTo5': 'Paleobiology Database',
            'canonical5': 'Apis mellifera',
            'sourceIdentifier5': '283625',
            'taxonRank5': 'Species',
            'id6': 50293009,
            'scientificName6': 'Apis mellifera',
            'accordingTo6': 'Taxonomic Hierarchy of COL-China 2012',
            'canonical6': 'Apis mellifera',
            'sourceIdentifier6': '44bde209-1a83-48bc-bacf-877b39463c35',
            'taxonRank6': 'Species',
            'id7': 51183343,
            'scientificName7': 'Apis mellifera',
            'accordingTo7': 'NCBI Taxonomy',
            'canonical7': 'Apis mellifera',
            'sourceIdentifier7': '7460',
            'taxonRank7': 'Species',
            'id8': 46497385,
            'scientificName8': 'Apis mellifera Linnaeus 1758',
            'accordingTo8': 'Integrated Taxonomic Information System (ITIS)',
            'canonical8': 'Apis mellifera',
            'sourceIdentifier8': '154396',
            'taxonRank8': 'Species'
          }
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/eol-meta.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s[\]→.\-,():/_@;<=">&]*/mig)
        done(err)
      })
    })
  })
  describe('page', (done) => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js eol page 1045608 -o ${process.cwd()}/test/output/eol-page.json > test/output/eol-page.out`, (err) => {
        const stdout = fs.readFileSync('test/output/eol-page.out', 'utf8')
        const obj = {
          'type': 'pages',
          'source': 'http://eol.org',
          'id': 1045608,
          'scientificName': 'Apis mellifera Linnaeus 1758',
          'taxonConcepts': {
            'id0': 52191458,
            'scientificName0': 'Apis mellifera Linnaeus 1758',
            'accordingTo0': 'Species 2000 & ITIS Catalogue of Life: April 2013',
            'canonical0': 'Apis mellifera',
            'sourceIdentifier0': '6845885',
            'taxonRank0': 'Species',
            'id1': 59534038,
            'scientificName1': 'Apis (Apis) mellifera Linnaeus 1758',
            'accordingTo1': 'Paleobiology Database',
            'canonical1': 'Apis mellifera',
            'sourceIdentifier1': '235173',
            'taxonRank1': 'Species',
            'id2': 49121298,
            'scientificName2': 'Apis (Apis) mellifera Linnaeus 1758',
            'accordingTo2': 'Paleobiology Database',
            'canonical2': 'Apis mellifera',
            'sourceIdentifier2': 'urn:paleodb:tn235173',
            'taxonRank2': 'Species',
            'id3': 49379619,
            'scientificName3': 'Apis (Apis) mellifera Linnaeus 1758',
            'accordingTo3': 'Paleobiology Database',
            'canonical3': 'Apis mellifera',
            'sourceIdentifier3': 'urn:paleodb:tn235173',
            'taxonRank3': 'Species',
            'id4': 55789671,
            'scientificName4': 'Apis mellifera Linnaeus 1758',
            'accordingTo4': 'Integrated Taxonomic Information System (ITIS)',
            'canonical4': 'Apis mellifera',
            'sourceIdentifier4': '154396',
            'taxonRank4': 'Species',
            'id5': 59631096,
            'scientificName5': 'Apis mellifera Linnaeus 1758',
            'accordingTo5': 'Paleobiology Database',
            'canonical5': 'Apis mellifera',
            'sourceIdentifier5': '283625',
            'taxonRank5': 'Species',
            'id6': 50293009,
            'scientificName6': 'Apis mellifera',
            'accordingTo6': 'Taxonomic Hierarchy of COL-China 2012',
            'canonical6': 'Apis mellifera',
            'sourceIdentifier6': '44bde209-1a83-48bc-bacf-877b39463c35',
            'taxonRank6': 'Species',
            'id7': 51183343,
            'scientificName7': 'Apis mellifera',
            'accordingTo7': 'NCBI Taxonomy',
            'canonical7': 'Apis mellifera',
            'sourceIdentifier7': '7460',
            'taxonRank7': 'Species',
            'id8': 46497385,
            'scientificName8': 'Apis mellifera Linnaeus 1758',
            'accordingTo8': 'Integrated Taxonomic Information System (ITIS)',
            'canonical8': 'Apis mellifera',
            'sourceIdentifier8': '154396',
            'taxonRank8': 'Species'
          },
          'dataObjects': {
            'id0': '715fac20e20b012e4c4f1e6699c0ad5e',
            'dataType0': 'http://purl.org/dc/dcmitype/Text',
            'vettedStatus0': 'Trusted',
            'dataRating0': 4.5,
            'subject0': 'http://rs.tdwg.org/ontology/voc/SPMInfoItems#TaxonBiology',
            'id1': 'd7c57c6dd644a74556b202edd0f5c9f2',
            'dataType1': 'http://purl.org/dc/dcmitype/StillImage',
            'vettedStatus1': 'Trusted',
            'dataRating1': 4.5,
            'id2': 'e70cb321fd2933d4db48b6c41271068b',
            'dataType2': 'http://purl.org/dc/dcmitype/MovingImage',
            'vettedStatus2': 'Trusted',
            'dataRating2': 3.3,
            'id3': '8787bca9f242f06fada02c341ab577d7',
            'dataType3': 'http://purl.org/dc/dcmitype/Sound',
            'vettedStatus3': 'Trusted',
            'dataRating3': 2.5,
            'id4': 'cad9dcc72cd30bdb185416e5a35fbc01',
            'dataType4': 'http://purl.org/dc/dcmitype/StillImage',
            'dataSubtype4': 'Map',
            'vettedStatus4': 'Trusted',
            'dataRating4': 4
          }
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/eol-page.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s[\]→.\-,():/_@;<=">#&]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('sbp', (done) => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js eol sbp 180542 -p 903 -o ${process.cwd()}/test/output/eol-sbp.json > test/output/eol-sbp.out`, (err) => {
        const stdout = fs.readFileSync('test/output/eol-sbp.out', 'utf8')
        const obj = {
          'type': 'search_by_provider',
          'source': 'http://eol.org',
          'eol_page_id': 328580,
          'eol_page_link': 'http://eol.org/pages/328580'
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/eol-sbp.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 →[\]:/.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('search', (done) => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/bin/iloa.js eol search homo sapiens > test/output/eol-search.out`, (err) => {
        const stdout = fs.readFileSync('test/output/eol-search.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \s[\]→,:/.?=&;\-()]*/mig)
        done(err)
      })
    })
  })
})
