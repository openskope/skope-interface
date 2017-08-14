import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import React from 'react';
import { mount } from 'react-mounter';

import { createStore } from 'meteor/zodiase:reactive-redux-store';

// Import actions for the redux store.
import * as actions from '/imports/ui/actions';
// Import reducers for the redux store.
import reducers from '/imports/ui/reducers';

// Import needed templates
import MainLayout from '/imports/ui/layouts/main/container';
import FullWindowLayout from '/imports/ui/layouts/full-window/container';
import HomePage from '/imports/ui/pages/home/container';
import SearchPage from '/imports/ui/pages/search/container';
import WorkspacePage from '/imports/ui/pages/workspace/container';
import ChartsPage from '/imports/ui/pages/workspace-charts/container';
import ModelPage from '/imports/ui/pages/model/container';
import NotFoundPage from '/imports/ui/pages/not-found/container';

import { clampFilterValue } from '/imports/ui/helper';

import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

const store = createStore(reducers);
//! Attach to window for debugging.
window.store = store;

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    const {
      // group,
      // name,
      path,
      // pathDef,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    mount(MainLayout, {
      store,
      body: <HomePage />,
    });
  },
});

FlowRouter.route('/search', {
  name: 'App.search',
  action() {
    const {
      path,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    mount(MainLayout, {
      store,
      body: (
        <SearchPage
          {...{
            store,
          }}
        />
      ),
    });
  },
});

FlowRouter.route('/workspace', {
  name: 'App.workspace',
  action(params, queryParams) {
    const {
      path,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    store.dispatch({
      type: actions.WORKSPACE_SET_FILTER.type,
      value: clampFilterValue(queryParams.filterValue === undefined ? rangeMax : queryParams.filterValue, rangeMin, rangeMax),
    });

    mount(FullWindowLayout, {
      store,
      body: (
        <WorkspacePage
          {...{
            store,
            putFilterValueInUrl: (newValue) => {
              FlowRouter.setQueryParams({
                filterValue: newValue,
              });
            },
          }}
        />
      ),
    });
  },
});

FlowRouter.route('/workspace/charts', {
  name: 'App.workspace.charts',
  action(params, queryParams) {
    const {
      path,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    const coord = [parseFloat(queryParams.longitude), parseFloat(queryParams.latitude)];
    Meteor.call('timeseries.get', { lon: coord[0], lat: coord[1] }, (error, result) => {
      store.dispatch({
        type: actions.CHARTS_INSPECT_POINT_RESOLVE_DATA.type,
        coordinate: coord,
        error,
        result,
      });
    });

    mount(ChartsPage, {
      store,
    });
  },
});

FlowRouter.route('/model', {
  name: 'App.model',
  action() {
    const {
      path,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    mount(FullWindowLayout, {
      store,
      body: (
        <ModelPage
          {...{
            store,
          }}
        />
      ),
    });
  },
});

FlowRouter.route('*', {
  name: 'App.notFound',
  action() {
    const {
      path,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    mount(MainLayout, {
      store,
      body: <NotFoundPage />,
    });
  },
});
