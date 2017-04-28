// Methods related to links

import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Samples, channelValueMin, channelValueMax } from "./collection.js";

Meteor.methods({
  'samples.get' ({ filterValue }) {
    check(filterValue, Match.Integer);

    Meteor._sleepForMs(300);

    const items = Samples.find({
      'properties.filterValue': {
        $lt: filterValue,
      },
    }).fetch();

    const distributions = items.reduce((acc, feature, index) => {
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
      items,
      distributions,
    };
  },
});
