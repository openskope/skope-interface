import { Meteor } from 'meteor/meteor';
import objectPath from 'object-path';
import Raven from 'raven-js';

export const setup = (options = {}) => {
  ((sentryDsn) => {
    if (!sentryDsn) {
      return;
    }

    if (Raven.isSetup()) {
      Raven.captureException(new Error('Redundant setup'));
      return;
    }

    const release = objectPath.get(options, 'release');

    Raven.config(sentryDsn, {
      release,
      logger: 'client',
    }).install();

    console.log('Sentry is up');
  })(objectPath.get(Meteor.settings, 'public.sentry.dsn'));
};

export default Raven;
