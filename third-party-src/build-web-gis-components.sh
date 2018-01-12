#!/bin/bash

# This script builds the `web-gis-components` and points the output directory
# to the proper folder located inside the Meteor app.

set -e

# Get directory of this script.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "${DIR}/web-gis-components"
DISTDIR="${DIR}/../meteor-app/public/web-gis-components" npm run build
