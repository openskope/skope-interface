import { createContainer } from 'meteor/react-meteor-data';
import {
  SearchkitManager,
} from 'searchkit';

import Component from './component';

const elasticEndpoint = Meteor.settings && Meteor.settings.public && Meteor.settings.public.elasticEndpoint || 'http://localhost:9200/';
const searchkit = new SearchkitManager(elasticEndpoint);

/** This does not work **/
// const searchkit = new SearchkitManager("http://localhost:9200/", {
//   basicAuth: "elastic:changeme",
// });

export default createContainer(() => ({
  searchkit,
}), Component);
