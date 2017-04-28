import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

// Import needed templates
import Layout_Main from "/imports/ui/layouts/main/container";
import Page_Home from "/imports/ui/pages/home/container";
import Page_Search from "/imports/ui/pages/search/container";
import Page_Workspace from "/imports/ui/pages/workspace/container";
import Page_NotFound from "/imports/ui/pages/not-found/container";

// Set up all routes in the app
FlowRouter.route("/", {
  name: "App.home",
  action() {
    mount(Layout_Main, {
      navInfo: null,
      body: <Page_Home/>,
    });
  },
});

FlowRouter.route("/search", {
  name: "App.search",
  action() {
    mount(Layout_Main, {
      navInfo: [
        {
          label: "SKOPE",
          url: FlowRouter.url("/"),
        },
        {
          label: "Search",
        },
      ],
      body: <Page_Search/>,
    });
  },
});

FlowRouter.route("/workspace", {
  name: "App.workspace",
  action(params, queryParams) {
    mount(Layout_Main, {
      navInfo: [
        {
          label: "SKOPE",
          url: FlowRouter.url("/"),
        },
        {
          label: "Workspace",
        },
      ],
      body: <Page_Workspace
              {...{
                queryParams,
                updateFilterValue: (newValue) => {
                  FlowRouter.go("/workspace", {}, {
                    filterValue: newValue,
                  });
                },
              }}
            />,
    });
  },
});

FlowRouter.notFound = {
  action() {
    mount(Layout_Main, {
      body: <Page_NotFound/>,
    });
  },
};
