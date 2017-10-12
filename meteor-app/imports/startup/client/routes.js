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
import FixedWidthLayout from '/imports/ui/layouts/fixed-width';
import FullWindowLayout from '/imports/ui/layouts/full-window';
import HomePage from '/imports/ui/pages/home';
import SearchPage from '/imports/ui/pages/search';
import WorkspacePage from '/imports/ui/pages/workspace';
import ChartsPage from '/imports/ui/pages/workspace-charts';
import PaleoCarModelPage from '/imports/ui/pages/model-paleocar';
import NotFoundPage from '/imports/ui/pages/not-found';
import AppbarHeader from '/imports/ui/components/appbar';

import {
  clampFilterValue,
  mountWithStore,
} from '/imports/ui/helpers';

import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

import {
  appSettings,
} from '/package.json';

const store = createStore(reducers);

if (appSettings.exposeStoreToGlobal) {
  window.store = store;
}

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    // These are available properties on the context.
    // - this.group
    // - this.name
    // - this.path
    // - this.pathDef

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path: this.pathDef,
    });

    mountWithStore(store, FixedWidthLayout, {
      header: <AppbarHeader />,
      body: <HomePage />,
      footer: null,
    });
  },
});

FlowRouter.route('/search', {
  name: 'App.search',
  action() {
    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path: this.pathDef,
    });

    mountWithStore(store, FixedWidthLayout, {
      header: <AppbarHeader />,
      body: <SearchPage />,
      footer: null,
    });
  },
});

FlowRouter.route('/workspace', {
  name: 'App.workspace',
  action(params, queryParams) {
    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path: this.pathDef,
    });

    store.dispatch({
      type: actions.WORKSPACE_SET_FILTER.type,
      value: clampFilterValue(queryParams.filterValue === undefined ? rangeMax : queryParams.filterValue, rangeMin, rangeMax),
    });

    mountWithStore(store, FullWindowLayout, {
      header: <AppbarHeader />,
      body: (
        <WorkspacePage
          putFilterValueInUrl={(newValue) => {
            FlowRouter.setQueryParams({
              filterValue: newValue,
            });
          }}
        />
      ),
      footer: null,
    });
  },
});

FlowRouter.route('/workspace/charts', {
  name: 'App.workspace.charts',
  action(params, queryParams) {
    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path: this.pathDef,
    });

    const coord = [
      parseFloat(queryParams.longitude),
      parseFloat(queryParams.latitude),
    ];

    Meteor.call('timeseries.get', { lon: coord[0], lat: coord[1] }, (error, result) => {
      store.dispatch({
        type: actions.CHARTS_INSPECT_POINT_RESOLVE_DATA.type,
        coordinate: coord,
        error,
        result,
      });
    });

    mountWithStore(store, ChartsPage);
  },
});

FlowRouter.route('/model/paleocar', {
  name: 'App.model.paleocar',
  action() {
    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path: this.pathDef,
    });

    mountWithStore(store, FullWindowLayout, {
      header: <AppbarHeader />,
      body: <PaleoCarModelPage />,
      footer: null,
    });
  },
});

FlowRouter.route('*', {
  name: 'App.notFound',
  action() {
    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path: this.pathDef,
    });

    mountWithStore(store, FixedWidthLayout, {
      header: <AppbarHeader />,
      body: <NotFoundPage />,
      footer: null,
    });
  },
});
