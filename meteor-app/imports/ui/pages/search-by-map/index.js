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
import { Meteor } from 'meteor/meteor';

import {
  appSettings,
} from '/package.json';

import globalStore, { actions } from '/imports/ui/redux-store';

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

    return {
      ...queryObject,

      aggs: {
        ...(queryObject.aggs || {}),

        'data-temporal-min-start': {
          min: {
            field: 'StartDate',
          },
        },
        'data-temporal-min-end': {
          min: {
            field: 'EndDate',
          },
        },
        'data-temporal-max-start': {
          max: {
            field: 'StartDate',
          },
        },
        'data-temporal-max-end': {
          max: {
            field: 'EndDate',
          },
        },
      },
    };
  });
}

if (appSettings.logSearchKitQueryResults) {
  // Monitor search results.
  searchkit.addResultsListener((result) => {
    console.info('queryResult', result);

    globalStore.dispatch({
      type: actions.SEARCH_UPDATE_RESULT.type,
      result,
    });
  });
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
