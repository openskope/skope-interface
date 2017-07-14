import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import { createStore } from "meteor/zodiase:reactive-redux-store";

// Import actions for the redux store.
import * as actions from "/imports/ui/actions";
// Import reducers for the redux store.
import reducers from "/imports/ui/reducers";

// Import needed templates
import Layout_Main from "/imports/ui/layouts/main/container";
import Layout_FullWindow from "/imports/ui/layouts/full-window/container";
import Page_Home from "/imports/ui/pages/home/container";
import Page_Search from "/imports/ui/pages/search/container";
import Page_Workspace from "/imports/ui/pages/workspace/container";
import Page_NotFound from "/imports/ui/pages/not-found/container";

const store = createStore(reducers);
//! Attach to window for debugging.
window.store = store;

// Set up all routes in the app
FlowRouter.route("/", {
  name: "App.home",
  action() {

    const {
      //group,
      //name,
      path,
      //pathDef,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    mount(Layout_Main, {
      store,
      body: <Page_Home/>,
    });
  },
});

FlowRouter.route("/search", {
  name: "App.search",
  action(params, queryParams) {

    const {
      path,
    } = this;
    const {
      search: {
        input: prevSearchString,
      },
    } = store.getState();
    const nextSearchString = queryParams.q;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    store.dispatch({
      type: actions.SEARCH_SET_INPUT_FROM_URL.type,
      value: nextSearchString,
    });

    if (nextSearchString !== prevSearchString) {
      Meteor.call("search", {input: nextSearchString}, (error, result) => {
        store.dispatch({
          type: actions.SEARCH_RESOLVE_DATA.type,
          input: nextSearchString,
          error,
          result,
        });
      });
    }

    mount(Layout_Main, {
      store,
      body: (
        <Page_Search {...{
          store,
          updateSearchInput: (newValue) => {
            FlowRouter.go(path, {}, {
              q: newValue,
            });
          },
        }}/>
      ),
    });
  },
});

FlowRouter.route("/workspace", {
  name: "App.workspace",
  action(params, queryParams) {

    const {
      path,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    store.dispatch({
      type: actions.WORKSPACE_SET_FILTER_FROM_URL.type,
      value: queryParams.filterValue,
    });

    mount(Layout_FullWindow, {
      store,
      body: (
        <Page_Workspace {...{
          store,
          updateFilterValue: (newValue) => {
            FlowRouter.go(path, {}, {
              filterValue: newValue,
            });
          },
        }} />
      ),
    });
  },
});

FlowRouter.notFound = {
  action() {

    const {
      path,
    } = this;

    store.dispatch({
      type: actions.PAGE_ENTRY.type,
      path,
    });

    mount(Layout_Main, {
      body: <Page_NotFound/>,
    });
  },
};
