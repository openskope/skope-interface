#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "${DIR}/ENV_VARS"

cd "${DIR}/../meteor-app"
meteor npm i
meteor run --settings "${DIR}/meteor-settings.json"
