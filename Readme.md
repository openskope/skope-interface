# SKOPE Web App

The app is deployed at http://staging.openskope.org/app.

## To develop the app locally

Checkout this repo instead: https://github.com/openskope/skope-development, and follow the instructions in its readme.

## To deploy the app

- Enter the `deployment` directory.
- Run `bash build.sh` to build a Docker image. By default the new image will have tag `openskope/web-app:<TAG>` where `TAG` is the `version` inside `meteor-app/package.json`.
- Run `docker push openskope/web-app:<TAG>` to push the new image to DockerHub.
- Head to the server, run (for example) `TAG=1.2.3 bash /home/ubuntu/start-web.sh` to pull image `openskope/web-app:1.2.3` from DockerHub and run.
- The script will also load settings from (on the server) `/home/ubuntu/meteor-app.json` into the app. Update it if needed.
- If you don't have the helper scripts, well then you are facing a ton of trouble setting things up and we are not going to cover those in this document, unfortunately.
