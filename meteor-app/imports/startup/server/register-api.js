import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';

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
    const fakeDelay = 3000;
    const fakeData = {
      datasetId,
      // Title to be displayed in the workspace.
      title: 'National Elevation Data (NED)',
      // This affects how the consumer interprets the `data` field.
      type: 'default',
      data: {
        status: 'to be determined',
        description: 'general description about this dataset. For environmental data this description is provided by domain experts, for model results it is provide by model configuration time.',
        dataExtent: [-118.67431640625, 33.91208674157048, -109.88525390625, 42.92087580407048],
        yearStart: 1010,
        yearEnd: 2020,
        layers: [
          {
            title: 'Example layer 1',
            type: 'undefined',
            url: 'a/b/c/{x}/{y}/{z}/f',
          },
          {
            title: 'Example layer 2',
            type: 'undefined',
            url: 'a/b/c/{x}/{y}/{z}/f',
          },
          {
            title: 'Example layer 3',
            type: 'undefined',
            url: 'a/b/c/{x}/{y}/{z}/f',
          },
          {
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
