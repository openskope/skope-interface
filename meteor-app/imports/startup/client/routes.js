import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { FlowRouterTitle } from 'meteor/ostrio:flow-router-title';
import ReactGA from 'react-ga';
import objectPath from 'object-path';

// Import needed templates
import SearchPage from '/imports/ui/pages/search-by-map';
import WorkspacePage from '/imports/ui/pages/dynamic-workspace';
import NotFoundPage from '/imports/ui/pages/not-found';

import {
  simpleMountAction,
} from '/imports/helpers/ui/routing';
import {
  NOOP,
} from '/imports/helpers/model';

// Set default document.title value in case router has no title property.
FlowRouter.globals.push({
  title: 'SKOPE',
});

// These triggers are called before those defined in individual routes.
FlowRouter.triggers.enter([
  (context) => ReactGA.pageview(context.path),
]);

// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  title: 'Home - SKOPE',
  triggersEnter: [(context, redirect) => {
    redirect('/discover');
  }],
  action: NOOP,
});

// Deprecated route.
FlowRouter.route('/search', {
  name: 'App.search',
  title: 'Search - SKOPE',
  triggersEnter: [(context, redirect) => {
    redirect('/discover');
  }],
  action: NOOP,
});

// Deprecated route.
FlowRouter.route('/explore', {
  name: 'App.explore',
  title: 'Explore - SKOPE',
  triggersEnter: [(context, redirect) => {
    redirect('/discover');
  }],
  action: NOOP,
});

FlowRouter.route('/discover', {
  name: 'App.discover',
  title: 'Discover - SKOPE',
  action: simpleMountAction(SearchPage),
});

FlowRouter.route('/workspace', {
  name: 'App.workspace',
  title: 'Workspace - SKOPE',
  action: simpleMountAction(WorkspacePage),
});

FlowRouter.route('*', {
  name: 'App.notFound',
  title: 'Page not found - SKOPE',
  action: simpleMountAction(NotFoundPage),
});

export
const titleHandler = new FlowRouterTitle(FlowRouter);

((gaTrackingId) => {
  if (!gaTrackingId) {
    return;
  }

  ReactGA.initialize(gaTrackingId);
})(objectPath.get(Meteor.settings, 'public.gaTrackingId'));
