#!/bin/bash

set -e

# Get current directory.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Read version tag from the npm package file, if not provided.
JS="\
var fs = require('fs');\
var npmFile = '${DIR}/../../meteor-app/package.json';\
var npmFileContent = fs.readFileSync(npmFile);\
var npmInfo = JSON.parse(npmFileContent);\
var packageVersion = npmInfo.version;\
console.log(packageVersion);\
"
TAG=${TAG:-$(echo $JS | node)}

(
  cd "${DIR}/../../meteor-app" && \
  meteor npm install --production --unsafe-perm && \
  meteor build --architecture os.linux.x86_64 "${DIR}"
)

docker build -t openskope/web-app:$TAG "${DIR}"
