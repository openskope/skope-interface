# This Dockerfile is used to build the production bundle for a Meteor app.

ARG METEOR_VERSION="1.6.0.1"
ARG NODE_VERSION="8.9.3"
ARG APP_DIR="/usr/share/meteor-app"

FROM ubuntu:16.04 AS build
LABEL maintainer="Xingchen Hong <hello@xc-h.com>"

ARG METEOR_VERSION
ARG APP_DIR

RUN apt-get update \
    && apt-get install -y -q build-essential \
                             libssl-dev curl git \
                             python-dev \
    && apt-get install -y -q locales \
    && locale-gen en_US.UTF-8 \
    && localedef -i en_GB -f UTF-8 en_US.UTF-8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV HOME="/home/meteor"
RUN useradd -m -s /bin/bash meteor \
    && mkdir -p "${APP_DIR}" \
    && chown meteor:meteor "${APP_DIR}"
USER meteor

# Install Meteor.
RUN curl "https://install.meteor.com/?release=${METEOR_VERSION}" | sh
ENV METEOR_PATH="${HOME}/.meteor"
ENV PATH="$PATH:$METEOR_PATH"

ADD --chown=meteor:meteor ./meteor-app "${APP_DIR}/source"
RUN cd "${APP_DIR}/source" \
    && meteor npm install --production --unsafe-perm \
    && meteor build "${APP_DIR}" --directory --architecture os.linux.x86_64

FROM node:${NODE_VERSION}-slim
LABEL maintainer="Xingchen Hong <hello@xc-h.com>"

ARG APP_DIR

RUN apt-get update \
    && apt-get install -y -q build-essential \
                             libssl-dev curl git \
                             python-dev \
    && apt-get install -y -q locales \
    && locale-gen en_US.UTF-8 \
    && localedef -i en_GB -f UTF-8 en_US.UTF-8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV HOME="/home/meteor"
RUN useradd -m -s /bin/bash meteor \
    && mkdir -p "${APP_DIR}" \
    && chown meteor:meteor "${APP_DIR}"
WORKDIR "${APP_DIR}"
USER meteor

# Meteor Port Config
ENV NODE_ENV="production" \
    ROOT_URL="http://localhost" \
    MONGO_URL="mongodb://localhost" \
    METEOR_SETTINGS='{"public":{}}' \
    PORT=3000

COPY --from=build --chown=meteor:meteor "${APP_DIR}/bundle" "${APP_DIR}/bundle"
ADD --chown=meteor:meteor ./meteor-app.settings.default.json "${APP_DIR}/app-settings.json"
ADD --chown=meteor:meteor ./Dockerfile.entrypoint.sh "${APP_DIR}/entrypoint.sh"

ENTRYPOINT bash entrypoint.sh
