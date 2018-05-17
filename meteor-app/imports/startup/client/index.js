// Import client startup through a single index entry point

import { Meteor } from 'meteor/meteor';
import objectPath from 'object-path';
import Raven from 'raven-js';
import 'typeface-roboto';

import globalStore, { actions } from '/imports/ui/redux-store';

import './routes.js';

((sentryDsn) => {
  if (!sentryDsn) {
    return;
  }

  Raven.config(sentryDsn, {
    logger: 'client',
  }).install();

  console.log('Sentry is up');
})(objectPath.get(Meteor.settings, 'public.sentry.dsn'));

Meteor.call('buildHash', (error, result) => {
  if (error) {
    return;
  }

  globalStore.dispatch({
    type: actions.FETCH_BUILD_HASH.type,
    hash: result,
  });
});
