# This image is a run-time environment for running the Meteor app in development mode.
# When creating containers, the Meteor app folder should be mounted at `APPDIR` specified below.

FROM ubuntu:14.04
LABEL maintainer="Xingchen Hong <hello@xc-h.com>"

# Do not use apt-get upgrade or dist-upgrade. See: https://github.com/lukasmartinelli/hadolint/wiki/DL3005
# Delete the apt-get lists after installing something. See: https://github.com/lukasmartinelli/hadolint/wiki/DL3009
RUN apt-get update \
    && apt-get install -y -q build-essential \
                             libssl-dev curl git \
                             python-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure locales.
RUN apt-get install locales \
    && locale-gen en_US.UTF-8 \
    && localedef -i en_GB -f UTF-8 en_US.UTF-8

# Configure env vars.
ENV APPDIR="/usr/share/meteor-app" \
    APPCFG="/usr/share/meteor-app-settings.json" \
    USER="meteor"

# Provide an empty settings file. Writing to the directory requires root access.
RUN printf '{"public":{}}' > "${APPCFG}"

# Switch to end user.
RUN useradd -m -s /bin/bash "$USER"
ENV HOME="/home/$USER"
USER "$USER"
WORKDIR "$HOME"

# Install NodeJS with NVM.
ARG nvm_version="0.33.8"
ARG node_version="8.9.3"
RUN curl -o- "https://raw.githubusercontent.com/creationix/nvm/v${nvm_version}/install.sh" | bash \
    && export NVM_DIR="${HOME}/.nvm" \
    && [ -s "${NVM_DIR}/nvm.sh" ] && . "${NVM_DIR}/nvm.sh" \
    && nvm install ${node_version} \
    && nvm alias default ${node_version} \
    && nvm use default
# Setup envs to allow usage of node and npm in dockerfile.
ENV NVM_DIR="${HOME}/.nvm"
ENV PATH="${NVM_DIR}/versions/node/v${node_version}/bin:${PATH}" \
    NODE_PATH="${NVM_DIR}/versions/node/v${node_version}/lib/node_modules:${NODE_PATH}"

# Install Meteor.
ARG meteor_version="1.6.0.1"
RUN curl "https://install.meteor.com/?release=${meteor_version}" | sh
ENV METEOR_PATH="${HOME}/.meteor"
ENV PATH="$PATH:$METEOR_PATH"

EXPOSE 3000

# Download the entrypoint script.
RUN curl -L -o ./entrypoint.sh https://gist.githubusercontent.com/Zodiase/648bf2a551f9723d8d4508f8cba058dd/raw/82b5a13ca24ab684b6311bcd6aa71090d8319ecf/entrypoint.sh \
    && chmod 500 ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
CMD 'meteor npm install && meteor run --settings ../meteor-app-settings.json'
