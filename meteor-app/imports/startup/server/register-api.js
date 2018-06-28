import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import httpProxy from 'http-proxy';
import url from 'url';
import path from 'path';
import objectPath from 'object-path';
import * as elasticsearch from 'elasticsearch';

import buildGitCommit from '/imports/server/build-hash';

import Raven from './sentry';

const serverElasticEndpointInSettings = objectPath.get(Meteor.settings, 'server.elasticEndpoint');

// Register your apis here

const getDatasetBySkopeId = async (skopeId) => {
  if (!serverElasticEndpointInSettings) {
    return null;
  }

  const client = new elasticsearch.Client({
    host: serverElasticEndpointInSettings,
  });

  const {
    took,
    timed_out: timedOut,
    hits: {
      total,
      hits,
    },
  } = await client.search({
    index: 'datasets',
    type: 'dataset',
    body: {
      query: {
        term: {
          skopeid: skopeId,
        },
      },
    },
  });

  console.log('Looking up datasets by skopeid.', {
    skopeId,
    took,
    timedOut,
    hits: total,
  });

  if (timedOut || total === 0) {
    const exception = new Error('Unable to find datasets by skope ID.');

    Raven.captureException(exception, {
      extra: {
        skopeId,
        took,
        timedOut,
        hits: total,
      },
    });

    return null;
  }

  return hits[0];
};

Meteor.methods({
  buildHash () {
    return buildGitCommit;
  },
  async 'datasetManifest.get' ({
    datasetId,
  }) {
    const dataset = await getDatasetBySkopeId(datasetId);

    if (!dataset) {
      throw new Meteor.Error('Not Found', 'Unable to find dataset.');
    }

    return dataset._source;
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
