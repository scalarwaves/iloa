#!/bin/bash

mkdir -p cson
node bin/iloa.js wunder -e almanac -o cson/almanac.cson -f KISM
node bin/iloa.js wunder -e conditions -o cson/conditions.cson -f KISM
node bin/iloa.js wunder -e geolookup -o cson/geolookup.cson -f KISM
node bin/iloa.js wunder -e forecast -o cson/forecast.cson -f KISM
node bin/iloa.js wunder -e hourly -o cson/hourly.cson -f KISM
node bin/iloa.js wunder -e webcams -o cson/webcams.cson -f KISM
node bin/iloa.js wunder -e yesterday -o cson/yesterday.cson -f KISM
