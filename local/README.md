There is no Docker setup for development yet.

`elasticsearch` is stuff for running the local ElasticSearch instance.
`meteor-settings.json` is an example config file used for development.
`ENV_VARS` is used to configure environment variables for the Meteor app.
`run-app.sh` is a helper script to run the Meteor app with the appropriate environment variables and settings.

You can, for example, change the `public.elasticEndpoint` to point to the local ElasticSearch instance if you need to play with local data.
