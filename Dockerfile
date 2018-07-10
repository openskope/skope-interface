# This Dockerfile is used to build the production bundle for a Meteor app.

ARG GIT_COMMIT=""

FROM zodiase/meteor-tool:1.7.0.3 AS build

USER root

RUN mkdir -p /usr/share/meteor-app \
    && chown -R meteor:meteor /usr/share/meteor-app

#! TODO: Use the line below to replace the workaround when `17.09` is landed
# on Docker Cloud.
# See https://github.com/moby/moby/issues/35731#issuecomment-360666913
#
# ADD --chown=meteor:meteor ./meteor-app "/usr/share/meteor-app/source"
#
#! Workaround begins.
ADD ./meteor-app "/usr/share/meteor-app/source"
RUN chown -R meteor:meteor "/usr/share/meteor-app/source"
#! End of workaround.

USER meteor

RUN cd "/usr/share/meteor-app/source" \
    && meteor npm install --production --unsafe-perm \
    && meteor build "/usr/share/meteor-app" --directory --architecture os.linux.x86_64

FROM node:8.11.3-slim
LABEL maintainer="Xingchen Hong <hello@xc-h.com>"

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
    && mkdir -p "/usr/share/meteor-app" \
    && chown -R meteor:meteor "/usr/share/meteor-app"
WORKDIR "/usr/share/meteor-app"

ARG GIT_COMMIT

# Meteor Port Config
ENV NODE_ENV="production" \
    ROOT_URL="http://localhost" \
    MONGO_URL="mongodb://localhost" \
    METEOR_SETTINGS='{"public":{}}' \
    PORT=3000 \
    BUILD_GIT_COMMIT="${GIT_COMMIT}"

#! TODO: Use the lines below to replace the workaround when `17.09` is landed
# on Docker Cloud.
# See https://github.com/moby/moby/issues/35731#issuecomment-360666913
#
# COPY --from=build --chown=meteor:meteor "/usr/share/meteor-app/bundle" "/usr/share/meteor-app/bundle"
# ADD --chown=meteor:meteor ./meteor-app.settings.default.json "/usr/share/meteor-app/app-settings.json"
# ADD --chown=meteor:meteor ./Dockerfile.entrypoint.sh "/usr/share/meteor-app/entrypoint.sh"
#
#! Workaround begins.
COPY --from=build "/usr/share/meteor-app/bundle" "/usr/share/meteor-app/bundle"
ADD ./meteor-app.settings.default.json "/usr/share/meteor-app/app-settings.json"
ADD ./Dockerfile.entrypoint.sh "/usr/share/meteor-app/entrypoint.sh"
RUN chown -R meteor:meteor "/usr/share/meteor-app"
#! End of workaround.

USER meteor
ENTRYPOINT bash entrypoint.sh
