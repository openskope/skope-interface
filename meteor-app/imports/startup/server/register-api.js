import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { WebApp } from 'meteor/webapp';
import httpProxy from 'http-proxy';
import path from 'path';

// Register your apis here

Meteor.methods({
  'timeseries.get' ({
    lat,
    lon,
    requestId,
  }) {
    check(lat, Number);
    check(lon, Number);
    check(requestId, String);

    const url = `http://demo.envirecon.org/browse/skope-rasterdata-service/api/v1/timeseries?long=${lon}&lat=${lat}`;
    const {
      // statusCode,
      // content,
      data,
      // headers,
    } = HTTP.get(url);

    return {
      requestId,
      data,
    };
  },
  'datasetManifest.get' ({
    datasetId,
  }) {
    //! Request data from real backend.
    const fakeDelay = 100;
    const fakeData = {
      datasetId,
      // Title to be displayed in the workspace.
      title: 'National Elevation Data (NED)',
      // This affects how the consumer interprets the `data` field.
      type: 'default',
      data: {
        status: 'to be determined',
        description: 'general description about this dataset. For environmental data this description is provided by domain experts, for model results it is provide by model configuration time.',
        dataExtent: [-114.995833333, 30.995833333999997, -101.995833333, 42.995833334],
        yearStart: 1,
        yearEnd: 2000,
        layers: [
          {
            id: 'gdd',
            title: 'Example layer (GDD)',
            type: 'wms',
            endpoint: 'http://141.142.211.232/geoserver/SKOPE/wms',
            // layer: 'SKOPE:paleocar_1_GDD_{year}0101',
            layer: 'SKOPE:paleocar_1_GDD_00010101',
          },
          {
            id: 'ptt',
            title: 'Example layer (PTT)',
            type: 'wms',
            endpoint: 'http://141.142.211.232/geoserver/SKOPE/wms',
            layer: 'SKOPE:paleocar_1_PTT_00010101',
          },
          {
            id: 'example-3',
            title: 'Example layer 3',
            type: 'undefined',
            url: 'a/b/c/{x}/{y}/{z}/f',
          },
          {
            id: 'example-4',
            title: 'Example layer 4',
            type: 'undefined',
            url: 'a/b/c/{x}/{y}/{z}/f',
          },
        ],
        dataUrl: 'a/b/c/{x}/{y}/{z}/f',
        metadata: {
          foobar: 'I have no idea what is here.',
        },
        // ...
      },
    };

    Meteor._sleepForMs(fakeDelay);

    return fakeData;
  },
});

// Proxy to Elastic Search.
(() => {
  const proxy = httpProxy.createProxyServer({});
  const proxyEndpoint = path.resolve('/', Meteor.settings.public.elasticEndpoint);
  const proxyTarget = Meteor.settings.server.elasticEndpoint;

  // Listen to incoming HTTP requests.
  WebApp.connectHandlers.use(proxyEndpoint, (req, res /* , next */) => {
    proxy.web(req, res, {
      target: proxyTarget,
    });
  });
})();
