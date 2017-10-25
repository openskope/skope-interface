# This Dockerfile is used to build the production image for TopoLens.
# It expects an app bundle file located at `app.tar.gz`.

FROM ubuntu:14.04
MAINTAINER Xingchen Hong <hello@xc-h.net>

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
WORKDIR "${HOME}"

# Install NodeJS with NVM
ARG nvm_version="0.33.0"
ARG node_version="4.7.2"
RUN curl -o- "https://raw.githubusercontent.com/creationix/nvm/v${nvm_version}/install.sh" | bash \
    && export NVM_DIR="${HOME}/.nvm" \
    && [ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh" \
    && nvm install ${node_version} \
    && nvm alias default ${node_version} \
    && nvm use default
ENV NVM_DIR="${HOME}/.nvm"
ENV PATH="${NVM_DIR}/versions/node/v${node_version}/bin:${PATH}" \
    NODE_PATH="${NVM_DIR}/versions/node/v${node_version}/lib/node_modules:${NODE_PATH}"
RUN chown -R "${USER}":"${USER}" "${NVM_DIR}"


# Copy app bundle and extract it
ADD ./meteor-app.tar.gz "${HOME}"
# Extracting the app bundle will create a folder named "bundle".
ENV APP_DIR="${HOME}/bundle"

# Setup app.
RUN chown -R "${USER}":"${USER}" "${APP_DIR}" \
    && cd "${APP_DIR}" \
    && (cd programs/server && npm install --unsafe-perm)
RUN printf '#!/bin/bash\nnode "%s/main.js"\n' "${APP_DIR}" >> start.sh

# Meteor Port Config
ENV ROOT_URL="http://localhost" \
    MONGO_URL="mongodb://localhost" \
    METEOR_SETTINGS='{"public":{}}' \
    PORT=3000

ENTRYPOINT bash start.sh

USER "${USER}"
