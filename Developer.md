## Meteor App

### The config file (`meteor-settings.json`)

The purpose of using this file is to easily use different sets of configurations for different deployments.

Note that per Meteor design, only `public` field is exposed to client-side.

- `public.elasticEndpoint` defines what endpoint the SearchKit should be using for querying.
    Since we are using Meteor to proxy the request to the Elastic Search, this should point to the proxy endpoint.
    (The proxy code actually reads this value to setup the endpoint.)
- `server.elasticEndpoint` defines where the elastic search server endpoint is. This is used by the proxy to forward search queries.

### Conventions

- `Meteor.methods`
    - Method names should be descriptive and in the form of `<entity>.<action>`. For example:
        - `userAge.get`
        - `userOccupation.set`
        - `post.delete`
        - `authentication.invalidate`
    - Instead of taking multiple arguments, use a dictionary of arguments so they are named and unordered. For example:

        ```JavaScript
        Meteor.methods({
          'book.find' ({
            author,
            genre,
            publisher,
          }) {
            //...
          },
        });
        ```
