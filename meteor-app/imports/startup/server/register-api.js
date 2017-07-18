import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';

// Register your apis here

Meteor.methods({
  'timeseries.get' ({ lat, lon }) {
    check(lat, Number);
    check(lon, Number);

    const url = `http://demo.envirecon.org/browse/skope-rasterdata-service/api/v1/timeseries?long=${lon}&lat=${lat}`;
    const {
      // statusCode,
      // content,
      data,
      // headers,
    } = HTTP.get(url);

    return data;
  },
  'search' ({ input }) {
    //! Return fake search results.
    Meteor._sleepForMs(800);

    return {
      input,
      data: [
        {
          title: "Some fake result 1",
          model: "some-model-id-1",
          type: "some-data-type-1",
          source: "some-data-source-1",
        },
        {
          title: "Some fake result 2",
          model: "some-model-id-2",
          type: "some-data-type-1",
          source: "some-data-source-1",
        },
        {
          title: "Some fake result 3",
          model: "some-model-id-1",
          type: "some-data-type-2",
          source: "some-data-source-1",
        },
        {
          title: "Some fake result 4",
          model: "some-model-id-1",
          type: "some-data-type-1",
          source: "some-data-source-2",
        },
        {
          title: "Some fake result 5",
          model: "some-model-id-2",
          type: "some-data-type-2",
          source: "some-data-source-1",
        },
        {
          title: "Some fake result 6",
          model: "some-model-id-2",
          type: "some-data-type-1",
          source: "some-data-source-2",
        },
        {
          title: "Some fake result 7",
          model: "some-model-id-1",
          type: "some-data-type-2",
          source: "some-data-source-2",
        },
        {
          title: "Some fake result 1",
          model: "some-model-id-1",
          type: "some-data-type-3",
          source: "some-data-source-1",
        }
      ],
      "data-filters": [
        {
          title: "Models",
          property: "model",
          definitions: "models",
        },
        {
          title: "Data Types",
          property: "type",
          definitions: "types",
        },
        {
          title: "Data Sources",
          property: "source",
          definitions: "sources",
        },
      ],
      models: {
        "some-model-id-1": {
          title: "Some Model 1",
        },
        "some-model-id-2": {
          title: "Some Model 2",
        },
      },
      types: {
        "some-data-type-1": {
          title: "Some Data Type 1",
        },
        "some-data-type-2": {
          title: "Some Data Type 2",
        },
        "some-data-type-3": {
          title: "Some Data Type 3",
        },
      },
      sources: {
        "some-data-source-1": {
          title: "Some Data Source 1",
        },
        "some-data-source-2": {
          title: "Some Data Source 2",
        },
      }
    };
  },
});
