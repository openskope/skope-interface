# This Dockerfile is used to build the production image for SKOPE.

FROM node:8.9.3-slim

LABEL maintainer="Xingchen Hong <hello@xc-h.com>"

RUN apt-get update && \
    apt-get install bzip2 && \
    # Configure locales.
    apt-get install locales && \
    locale-gen en_US.UTF-8 && \
    localedef -i en_GB -f UTF-8 en_US.UTF-8

ENV HOME="/home/meteor" \
    APP_DIR="/usr/share/skope-web-app"
RUN useradd -m -s /bin/bash meteor
USER meteor
WORKDIR "${APP_DIR}"
#~242MB

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

ENTRYPOINT bash start.sh
#~572MB
