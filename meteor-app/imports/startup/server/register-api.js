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
});
