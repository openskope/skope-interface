#!/bin/bash

METEOR_SETTINGS="$(<./app-settings.json)"

cd bundle
(cd programs/server && npm install --unsafe-perm)
printf "Starting app...\n"
node main.js
