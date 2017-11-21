import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import React from 'react';

// Import needed templates
import HomePage from '/imports/ui/pages/home';
import SearchPage from '/imports/ui/pages/search-by-map';
import WorkspacePage from '/imports/ui/pages/tabbed-workspace';
import Charts from '/imports/ui/components/workspace-charts';
import PaleoCarModelPage from '/imports/ui/pages/model-paleocar--stepper';
import NotFoundPage from '/imports/ui/pages/not-found';

import {
  simpleMountAction,
} from '/imports/ui/helpers';

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action: simpleMountAction(HomePage),
});

FlowRouter.route('/search', {
  name: 'App.search',
  action: simpleMountAction(SearchPage),
});

FlowRouter.route('/workspace', {
  name: 'App.workspace',
  action: simpleMountAction(WorkspacePage),
});

FlowRouter.route('/model/paleocar', {
  name: 'App.model.paleocar',
  action: simpleMountAction(PaleoCarModelPage),
});

FlowRouter.route('*', {
  name: 'App.notFound',
  action: simpleMountAction(NotFoundPage),
});
