#!/bin/bash

mkdir -p data
node bin/iloa.js wunder -e alerts -o data/alerts.json -f KTPF
node bin/iloa.js wunder -e almanac -o data/almanac.json -f KTPF
node bin/iloa.js wunder -e astronomy -o data/astronomy.json -f KTPF
node bin/iloa.js wunder -e radar/satellite -o data/both.json -f KTPF
node bin/iloa.js wunder -e animatedradar/animatedsatellite -o data/bothanimated.json -f KTPF
node bin/iloa.js wunder -e conditions -o data/conditions.json -f KTPF
node bin/iloa.js wunder -e currenthurricane -o data/currenthurricane.json -f KTPF
node bin/iloa.js wunder -e forecast -o data/forecast.json -f KTPF
node bin/iloa.js wunder -e forecast10day -o data/forecast10day.json -f KTPF
node bin/iloa.js wunder -e geolookup -o data/geolookup.json -f KTPF
node bin/iloa.js wunder -e history -o data/history.json -f KTPF
node bin/iloa.js wunder -e hourly -o data/hourly.json -f KTPF
node bin/iloa.js wunder -e hourly10day -o data/hourly10day.json -f KTPF
node bin/iloa.js wunder -e planner -o data/planner.json -f KTPF
node bin/iloa.js wunder -e rawtide -o data/rawtide.json -f KTPF
node bin/iloa.js wunder -e tide -o data/tide.json -f KTPF
node bin/iloa.js wunder -e webcams -o data/webcams.json -f KTPF
node bin/iloa.js wunder -e yesterday -o data/yesterday.json -f KTPF
