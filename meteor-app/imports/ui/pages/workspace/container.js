import { createContainer } from 'meteor/react-meteor-data';
import _ from 'lodash';
import Component from './component';

const fakeDataExtent = [
  [
    -113.64257812499999,
    33.063924198120645
  ],
  [
    -84.55078125,
    45.089035564831036
  ],
];
const fakeDataQuantity = 1000;
const filterMin = 0,
      filterMax = 10;
const channelValueMin = 0,
      channelValueMax = 256;
const fakeData = {
  "type": "FeatureCollection",
  "features": Array.from({length: fakeDataQuantity}, (value, index) => ({
    "type": "Feature",
    "properties": {
      filterValue: _.random(filterMin, filterMax, false),
      channels: [
        // Alpha
        _.random(channelValueMin, channelValueMax, false),
        // Red
        _.random(channelValueMin, channelValueMax, false),
        // Green
        _.random(channelValueMin, channelValueMax, false),
        // Blue
        _.random(channelValueMin, channelValueMax, false),
      ],
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        _.random(fakeDataExtent[0][0], fakeDataExtent[1][0], true),
        _.random(fakeDataExtent[0][1], fakeDataExtent[1][1], true),
      ]
    }
  })),
};

export default createContainer((props) => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it.

  const {
    queryParams: {
      filterValue: filterValueStr,
    },
  } = props;

  let data = {...fakeData};
  const filterValue = filterValueStr ? parseInt(filterValueStr) : filterMax;

  data.features = data.features.filter((feature) => feature.properties.filterValue < filterValue);

  const channelDistributions = data.features.reduce((acc, feature, index) => {
    const {
      channels,
    } = feature.properties;
    return acc.map((channel, index) => channel.map((count, value) => (value === channels[index]) ? (count + 1) : count));
  }, [
    Array(channelValueMax - channelValueMin).fill(0),
    Array(channelValueMax - channelValueMin).fill(0),
    Array(channelValueMax - channelValueMin).fill(0),
    Array(channelValueMax - channelValueMin).fill(0),
  ]);

  return {
    data,
    filterMin,
    filterMax,
    filterValue,
    channelDistributions,
  };
}, Component);
