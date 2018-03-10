import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import httpProxy from 'http-proxy';
import url from 'url';
import path from 'path';
import objectPath from 'object-path';
import * as elasticsearch from 'elasticsearch';

const serverElasticEndpointInSettings = objectPath.get(Meteor.settings, 'server.elasticEndpoint');

// Register your apis here

Meteor.methods({
  async 'datasetManifest.get' ({
    datasetId,
  }) {
    if (!serverElasticEndpointInSettings) {
      return null;
    }

    const client = new elasticsearch.Client({
      host: serverElasticEndpointInSettings,
    });

    const response = await client.get({
      index: 'datasets',
      type: 'dataset',
      id: datasetId,
    });

    if (!response.found) {
      return null;
    }

    return response._source;
  },
});

// Proxy to Elastic Search.
(() => {
  const clientElasticEndpointInSettings = objectPath.get(Meteor.settings, 'public.elasticEndpoint');

  if (!clientElasticEndpointInSettings) {
    return;
  }

  const clientEndpointHasHostName = !!url.parse(clientElasticEndpointInSettings).host;

  // Don't do anything if the client-side endpoint is an absolute url (with host name).
  if (clientEndpointHasHostName) {
    return;
  }

  // Now we know the client-side endpoint is local, let's get the reverse-proxy setup.

  const proxyTarget = serverElasticEndpointInSettings;

  // If proxy target is not specified, do not start proxy server.
  if (!proxyTarget) {
    return;
  }

  const proxyEndpoint = path.resolve('/', clientElasticEndpointInSettings);
  const proxy = httpProxy.createProxyServer({});

  // Listen to incoming HTTP requests.
  WebApp.connectHandlers.use(proxyEndpoint, (req, res /* , next */) => {
    proxy.web(req, res, {
      target: proxyTarget,
    });
  });
})();
