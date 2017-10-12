/**
 * Search page.
 */

import React from 'react';
import {
  connect,
} from 'react-redux';
import {
  SearchkitManager,
} from 'searchkit';
import { Meteor } from 'meteor/meteor';

import Component from './component';

const elasticEndpoint = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.elasticEndpoint) || 'http://localhost:9200/';
const searchkit = new SearchkitManager(elasticEndpoint);

//! This does not work
// const searchkit = new SearchkitManager("http://localhost:9200/", {
//   basicAuth: "elastic:changeme",
// });

export default connect(
  // mapStateToProps
  (state, ownProps) => ({
    searchkit,
  }),
  // mapDispatchToProps
  null,
)(Component);
