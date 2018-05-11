/**
 * Search page.
 */

import React from 'react';
import {
  connect,
} from 'react-redux';
import {
  SearchkitManager,
  SearchkitProvider,
} from 'searchkit';
import 'searchkit/release/theme.css';

import globalStore, { actions } from '/imports/ui/redux-store';

import {
  clientElasticEndpoint as elasticEndpoint,
  _debug_logSearchKitQueries as logSearchKitQueries,
  _debug_logSearchKitQueryResults as logSearchKitQueryResults,
} from '/imports/ui/consts';

import {
  createFlowRouterHistory,
} from '/imports/ui/helpers';

import Component from './component';

const searchkit = new SearchkitManager(elasticEndpoint, {
  searchOnLoad: true,
  useHistory: true,
  createHistory: createFlowRouterHistory,
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

if (logSearchKitQueries) {
  // Monitor query object.
  searchkit.setQueryProcessor((queryObject) => console.info('queryObject', queryObject) || queryObject);
}

if (logSearchKitQueryResults) {
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
