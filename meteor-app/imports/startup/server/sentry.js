import { Meteor } from 'meteor/meteor';
import objectPath from 'object-path';
import Raven from 'raven';

((sentryDsn) => {
  if (!sentryDsn) {
    return;
  }

  Raven.config(sentryDsn, {
    logger: 'server',
  }).install();

  Raven.captureMessage('Server started.', {
    level: 'info',
  });

  console.log('Sentry is up');
})(objectPath.get(Meteor.settings, 'sentry.dsn'));

export default Raven;
