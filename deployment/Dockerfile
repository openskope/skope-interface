# This Dockerfile is used to build the production image for SKOPE.
# It expects an app bundle file located at `app.tar.gz`.

FROM ubuntu:14.04
#~188MB

LABEL maintainer="Xingchen Hong <hello@xc-h.com>"

# Versions should all start with a "v" when possible.
ARG nvm_version="v0.33.8"
ARG node_version

# Do not use apt-get upgrade or dist-upgrade. See: https://github.com/lukasmartinelli/hadolint/wiki/DL3005
# Delete the apt-get lists after installing something. See: https://github.com/lukasmartinelli/hadolint/wiki/DL3009
RUN apt-get update \
    && apt-get install -y -q build-essential \
                             libssl-dev curl \
                             python-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
#~393MB

# Configure locales.
RUN apt-get install locales \
    && locale-gen en_US.UTF-8 \
    && localedef -i en_GB -f UTF-8 en_US.UTF-8
#~395MB

ENV HOME="/home/meteor" \
    APP_DIR="/usr/share/skope-web-app"
RUN useradd -m -s /bin/bash meteor
USER meteor
WORKDIR "${APP_DIR}"
#~395MB

# Install NodeJS with NVM
RUN curl -o- "https://raw.githubusercontent.com/creationix/nvm/${nvm_version}/install.sh" | bash \
    && export NVM_DIR="${HOME}/.nvm" \
    && [ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh" \
    && nvm install ${node_version} \
    && nvm alias default ${node_version} \
    && nvm use default
ENV NVM_DIR="${HOME}/.nvm"
ENV PATH="${NVM_DIR}/versions/node/${node_version}/bin:${PATH}" \
    NODE_PATH="${NVM_DIR}/versions/node/${node_version}/lib/node_modules:${NODE_PATH}"
#~463MB

# Meteor Port Config
ENV ROOT_URL="http://localhost" \
    MONGO_URL="mongodb://localhost" \
    METEOR_SETTINGS='{"public":{}}' \
    PORT=3000

# Copy app bundle.
ADD --chown=meteor:meteor ./bundle "${APP_DIR}/bundle"
# Copy app settings.
ADD --chown=meteor:meteor ./app-settings.json "${APP_DIR}"
# Copy bootup script.
ADD --chown=meteor:meteor ./start.sh "${APP_DIR}"
#~793MB

# ENTRYPOINT bash start.sh

CMD bash
