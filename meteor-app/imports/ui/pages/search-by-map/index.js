/**
 * Search page.
 */

import {
  connect,
} from 'react-redux';
import {
  SearchkitManager,
} from 'searchkit';
import 'searchkit/release/theme.css';
import { Meteor } from 'meteor/meteor';

import {
  appSettings,
} from '/package.json';

import Component from './component';

const elasticEndpoint = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.elasticEndpoint) || 'http://localhost:9200/';
const searchkit = new SearchkitManager(elasticEndpoint);

//! This does not work
// const searchkit = new SearchkitManager("http://localhost:9200/", {
//   basicAuth: "elastic:changeme",
// });

if (appSettings.logSearchKitQueries) {
  // Monitor query object.
  searchkit.setQueryProcessor((queryObject) => {
    console.info('queryObject', queryObject);
    return queryObject;
  });
}

if (appSettings.logSearchKitQueryResults) {
  // Monitor search results.
  searchkit.addResultsListener((results) => {
    console.info('queryResult', results);
  });
}

export default connect(
  // mapStateToProps
  () => ({
    searchkit,
  }),
  // mapDispatchToProps
  null,
)(Component);
