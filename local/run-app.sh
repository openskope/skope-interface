. ENV_VARS

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ../../meteor-app
meteor npm i
meteor run --settings "${DIR}/meteor-settings.json"
