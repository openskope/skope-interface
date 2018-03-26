/**
 * Search page.
 */

import React from 'react';
import {
  connect,
} from 'react-redux';
import url from 'url';
import objectPath from 'object-path';
import {
  SearchkitManager,
  SearchkitProvider,
} from 'searchkit';
import 'searchkit/release/theme.css';
import { Meteor } from 'meteor/meteor';

import globalStore, { actions } from '/imports/ui/redux-store';

import Component from './component';

// If endpoint is not found in settings, use default localhost elastic.
const elasticEndpoint = url.resolve(Meteor.absoluteUrl(), objectPath.get(Meteor.settings, 'public.elasticEndpoint', 'http://localhost:9200/'));
const searchkit = new SearchkitManager(elasticEndpoint, {
  //! This is a workaround to search only the specific index. Find better solutions.
  searchUrlPath: '/datasets/_search',
});

//! This does not work
// const searchkit = new SearchkitManager("http://localhost:9200/", {
//   basicAuth: "elastic:changeme",
// });

// Update state with search result.
searchkit.addResultsListener((result) => globalStore.dispatch({
  type: actions.SEARCH_UPDATE_RESULT.type,
  result,
}));

if (objectPath.get(Meteor.settings, 'public.searchpage.logSearchKitQueries', false)) {
  // Monitor query object.
  searchkit.setQueryProcessor((queryObject) => console.info('queryObject', queryObject) || queryObject);
}

if (objectPath.get(Meteor.settings, 'public.searchpage.logSearchKitQueryResults', false)) {
  // Monitor search results.
  searchkit.addResultsListener((result) => console.info('queryResult', result));
}

export default connect(
  // mapStateToProps
  (state) => ({
    searchkit,
    searchResult: state.search.searchResult,
  }),
  // mapDispatchToProps
  null,
)((props) => (
  <SearchkitProvider searchkit={searchkit}>
    <Component {...props} />
  </SearchkitProvider>
));
