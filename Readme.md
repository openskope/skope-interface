# SKOPE Web App

The app is deployed at http://staging.openskope.org/app.

## To develop the app locally

Checkout this repo instead: https://github.com/openskope/skope-development, and follow the instructions in its readme.

## To deploy the app

- Automated building is setup at https://hub.docker.com/r/openskope/webapp/.
- But if you need to manually build:
    - Run:

        ```Bash
        bash build.manual.sh
        ```

        to build the Docker image. The new image will have tag `openskope/web-app:<TAG>`.

    - If you are on the `master` branch, `TAG` is the `version` inside `meteor-app/package.json`.
    - Otherwise, `TAG` will be the combination of the branch name and commit hash.

        See `build.manual.sh` for details.

    - You can also specify a custom tag with:

        ```Bash
        TAG=x.y.z bash build.manual.sh
        ```

    - If needed, run:

        ```Bash
        docker push openskope/web-app:<TAG>
        ```
        
        to push the new image to DockerHub.

- Head to the server, pull the image from DockerHub and run.

    Here's an example of the run configuration:

    ```Bash
    #!/bin/bash

    TAG="1.2.3"
    repo="openskope/web-app"
    container_name="skope-webapp"
    host_port=8080
    root_url="http://staging.openskope.org/app"

    docker pull $repo:$TAG
    docker rm -f $container_name
    docker run --detach \
            --restart always \
            --name $container_name \
            --network=apps-bridge \
            -v /path/to/custom/config.json:/usr/share/meteor-app/app-settings.json
            --env MONGO_URL="mongodb://mongodb/$container_name" \
            --env PORT=3000 \
            --publish $host_port:3000 \
            --env ROOT_URL="$root_url" \
            $repo:$TAG
    ```

    You'll want to use a custom settings file. See `meteor-app.settings.default.json` in the root directory to learn about the configurable options.
