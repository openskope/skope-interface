# This Dockerfile is used to build the production image for SKOPE.
# It expects an app bundle file located at `app.tar.gz`.

FROM ubuntu:14.04
LABEL maintainer="Xingchen Hong <hello@xc-h.com>"

# Do not use apt-get upgrade or dist-upgrade. See: https://github.com/lukasmartinelli/hadolint/wiki/DL3005
# Delete the apt-get lists after installing something. See: https://github.com/lukasmartinelli/hadolint/wiki/DL3009
RUN apt-get update \
    && apt-get install -y -q build-essential \
                             libssl-dev curl \
                             python-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure locales.
RUN apt-get install locales \
    && locale-gen en_US.UTF-8 \
    && localedef -i en_GB -f UTF-8 en_US.UTF-8

ENV USER="meteor"
RUN useradd -m -s /bin/bash "${USER}"
ENV HOME="/home/${USER}"
ENV APP_DIR="/usr/share/skope-web-app"
WORKDIR "${APP_DIR}"

# Install NodeJS with NVM
ARG nvm_version="0.33.8"
ARG node_version="8.9.3"
RUN curl -o- "https://raw.githubusercontent.com/creationix/nvm/v${nvm_version}/install.sh" | bash \
    && export NVM_DIR="${HOME}/.nvm" \
    && [ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh" \
    && nvm install ${node_version} \
    && nvm alias default ${node_version} \
    && nvm use default
ENV NVM_DIR="${HOME}/.nvm"
ENV PATH="${NVM_DIR}/versions/node/v${node_version}/bin:${PATH}" \
    NODE_PATH="${NVM_DIR}/versions/node/v${node_version}/lib/node_modules:${NODE_PATH}"

# Fix permission issues.
RUN chown -R "${USER}":"${USER}" "${HOME}"

# Copy app bundle and extract it.
# Extracting the app bundle will create a folder named "bundle".
ADD ./meteor-app.tar.gz "${APP_DIR}"
# Copy app settings.
ADD ./app-settings.json "${APP_DIR}"

# Setup app.
RUN printf '#!/bin/bash\nMETEOR_SETTINGS="$(<./app-settings.json)"\nnode "%s/main.js"\n' "${APP_DIR}/bundle" >> start.sh
RUN cd "${APP_DIR}/bundle" \
    && (cd programs/server && npm install --unsafe-perm) \
    && chown -R "${USER}":"${USER}" "${APP_DIR}"

# Meteor Port Config
ENV ROOT_URL="http://localhost" \
    MONGO_URL="mongodb://localhost" \
    METEOR_SETTINGS='{"public":{}}' \
    PORT=3000

ENTRYPOINT bash start.sh

USER "${USER}"
