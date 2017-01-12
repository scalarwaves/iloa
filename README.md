# iloa

[![Build Status](https://travis-ci.org/drawnepicenter/iloa.svg?branch=master)](https://travis-ci.org/drawnepicenter/iloa) [![Dependency Status](https://gemnasium.com/badges/github.com/drawnepicenter/iloa.svg)](https://gemnasium.com/github.com/drawnepicenter/iloa) [![Code Coverage](https://codeclimate.com/github/drawnepicenter/iloa/badges/coverage.svg)](https://codeclimate.com/github/drawnepicenter/iloa/coverage) [![Code Climate](https://codeclimate.com/github/drawnepicenter/iloa/badges/gpa.svg)](https://codeclimate.com/github/drawnepicenter/iloa) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![Git Town](https://img.shields.io/badge/workflow-git%20town-brightgreen.svg)](http://www.git-town.com/)

[![npm version](https://badge.fury.io/js/iloa.svg)](https://badge.fury.io/js/iloa) [![Downloads](https://img.shields.io/npm/dt/iloa.svg)](https://www.npmjs.com/package/iloa) [![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version) [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/mit-license.php) [![Semver 2.0.0](https://img.shields.io/badge/semver-2.0.0-ff69b4.svg)](http://semver.org/spec/v2.0.0.html)

[![Powered by DuckDuckGo](https://img.shields.io/badge/powered%20by-duckduckgo-brightgreen.svg)](https://duckduckgo.com/) [![Powered by EOL](https://img.shields.io/badge/powered%20by-eol-green.svg)](http://eol.org) [![Powered by Weather Underground](https://img.shields.io/badge/powered%20by-wunderground-yellow.svg)](http://www.wunderground.com) [![Powered by Wikipedia](https://img.shields.io/badge/powered%20by-wikipedia-orange.svg)](http://www.wikipedia.org) [![Powered by Wolfram|Alpha](https://img.shields.io/badge/powered%20by-wolfram%20alpha-red.svg)](http://www.wolframalpha.com)

## Introduction

*iloa* is [Samoan](https://en.wikipedia.org/wiki/Samoan_language) for **knowing**

iloa is a powerful tool for gaining knowledge from the command line. It queries [DuckDuckGo](https://duckduckgo.com/api), [Encyclopedia of Life](http://eol.org/), [Weather Underground](https://www.wunderground.com/), [Wikipedia](https://www.wikipedia.org), [Wolfram|Alpha](https://www.wolframalpha.com/about.html), and more through meta-searches. See the [wiki](https://github.com/drawnepicenter/iloa/wiki) for more info.

## Installation

To initialize the config file and load themes, your NODE_PATH environment variable must point to the **lib/node_modules** directory of the Node.js installation. You can set this path automatically like this:

    export NP=$(which node)
    export BP=${NP%bin/node} #this replaces the string '/bin/node'
    export LP="${BP}lib/node_modules"
    export NODE_PATH="$LP"
    
Provided these lines are towards the end of the shell initialization file (at least after any NVM stuff) this should work for a system installation of Node.js and [nvm](https://github.com/creationix/nvm).

- Put your [EOL API key](http://eol.org/users/register) from your EOL profile into an environment variable **EOLKEY**
- Put your [Weather Underground API key](https://www.wunderground.com/member/registration) into an environment variable **WUNDERGROUND**
- Put your [Wolfram|Alpha API key](http://developer.wolframalpha.com/portal/apisignup.html) into an environment variable **WOLFRAM**

Add all of this to .bashrc, .zshrc, Windows env, etc. then:

    npm install -g iloa
    iloa config init

## Usage

iloa has a built-in help system for CLI parameters and options. Access it with `iloa -h|--help [command] [subcommand]`. There is also the [wiki](https://github.com/drawnepicenter/iloa/wiki).

Here are some examples:
    
    // Get DuckDuckGo instant answers for Infected Mushroom
    iloa ddg 'Infected Mushroom'
    
    // Get Encyclopedia of Life pages for Homo sapiens
    iloa eol page 327955 -n -d -m -y -r -x
    
    // Get Weather Underground conditions and forecast for Tampa Knight Airport
    iloa wu -e conditions,forecast KTPF
    
    // Get Wolfram|Alpha computation of doppler shift
    iloa wa 'doppler shift'
    
    // Get Wikipedia article for George Gurdjieff
    iloa wp 'George Gurdjieff'

See the [tests](https://github.com/drawnepicenter/iloa/blob/master/test/test.es6) for more.

## Resources

The following links can help you use iloa or perform related tasks.

- [WikSearch](http://www.wiksearch.com) = [Datamuse](http://www.datamuse.com/api/) + [Wikipedia](https://www.wikipedia.org)
- [VTEC Info](http://www.nws.noaa.gov/os/vtec/pdfs/VTEC_explanation6.pdf), [US Severe Weather Map](http://www.wunderground.com/severe.asp) & [Euro Severe Weather Map](http://www.wunderground.com/severe/europe.html) for Wunderground alerts

## Contributing

See [CONTRIBUTING](https://github.com/drawnepicenter/iloa/blob/master/CONTRIBUTING.md).

## Gratitude

Many thanks to all contributors to the libraries used in this project! And thanks to the creators and maintainers of the APIs that this tool consumes. DuckDuckGo, Encyclopedia of Life, Weather Underground, Wikipedia, and Wolfram|Alpha are awesome!

### Take Command

See [take-command](https://github.com/drawnepicenter/take-command).
