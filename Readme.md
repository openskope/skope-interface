# SKOPE Web App

The app is deployed at http://skope-dev.roger.ncsa.illinois.edu/app.

## To develop the app locally

- Make sure you have the latest `node` and `npm` installed. We also suggest installing `nvm` for fast node version switching.
- Run a local Elastic Search instance (if needed).
	- You would need to have Docker installed.
    - Enter directory `local/elasticsearch`,
    - Run `npm i && npm start`, this will use the current shell session to run the Elastic Search instance in a Docker container.
	- While the container is running, use another shell session and run `npm run load-data -- <filename>` to load data to Elastic Search.
		- Need documentation on the data file format.
- Run the web app.
	- You would need to have Meteor installed.
	- Enter directory `local` directory.
	- Run `bash run-app.sh` to start the app in the current shell session with configurations in the `local` directory.
	- The running process will monitor any file changes in the directory and automatically re-build and restart the app. Typically there is no need to manually stop and restart the app.

## To deploy the app

- Enter the `deployment` directory.
- Run `bash build.sh` to build a Docker image. By default the new image will have tag `openskope/web-app:<TAG>` where `TAG` is the `version` inside `meteor-app/package.json`.
- Run `docker push openskope/web-app:<TAG>` to push the new image to DockerHub.
- Head to the server, run (for example) `TAG=1.2.3 bash /home/ubuntu/start-web.sh` to pull image `openskope/web-app:1.2.3` from DockerHub and run.
- The script will also load settings from (on the server) `/home/ubuntu/meteor-app.json` into the app. Update it if needed.
- If you don't have the helper scripts, well then you are facing a ton of trouble setting things up and we are not going to cover those in this document, unfortunately.
