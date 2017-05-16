// Fill the DB with example data on startup

import { Meteor } from "meteor/meteor";
import { Samples } from "/imports/api/samples/collection.js";

Meteor.startup(() => {
  Samples.remove({});
});
