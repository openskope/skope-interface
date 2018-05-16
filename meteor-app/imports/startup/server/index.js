// Import server startup through a single index entry point

import { Meteor } from 'meteor/meteor';
import objectPath from 'object-path';
import Raven from 'raven';

import './register-api.js';

((sentryDsn) => {
  if (!sentryDsn) {
    return;
  }

  Raven.config(sentryDsn, {
    logger: 'server',
  }).install();

  console.log('Sentry is up');
})(objectPath.get(Meteor.settings, 'sentry.dsn'));
