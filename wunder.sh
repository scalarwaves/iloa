#!/bin/bash

mkdir -p data
node bin/iloa.js wu -e alerts -o data/alerts.json -f KTPF
node bin/iloa.js wu -e almanac -o data/almanac.json -f KTPF
node bin/iloa.js wu -e astronomy -o data/astronomy.json -f KTPF
node bin/iloa.js wu -e conditions -o data/conditions.json -f KTPF
node bin/iloa.js wu -e forecast -o data/forecast.json -f KTPF
node bin/iloa.js wu -e forecast10day -o data/forecast10day.json -f KTPF
node bin/iloa.js wu -e geolookup -o data/geolookup.json -f KTPF
node bin/iloa.js wu -e hourly -o data/hourly.json -f KTPF
node bin/iloa.js wu -e hourly10day -o data/hourly10day.json -f KTPF
node bin/iloa.js wu -e tide -o data/tide.json -f KTPF
sleep 60
node bin/iloa.js wu -e webcams -o data/webcams.json -f KTPF
