// Import client startup through a single index entry point

import { onReady as onBuildHashReady } from '/imports/client/build-hash';
import globalStore, { actions } from '/imports/ui/redux-store';

import Raven, { setup as setupRaven } from './sentry';
import './routes';

onBuildHashReady((error, buildHash) => {
  if (error) {
    setupRaven({
      release: 'unknown',
    });
    Raven.captureException('Error while fetching build hash', {
      extra: {
        error,
        buildHash,
      },
    });
    return;
  }

  console.info(`Client build: ${buildHash}`);

  setupRaven({
    release: buildHash,
  });

  globalStore.dispatch({
    type: actions.FETCH_BUILD_HASH.type,
    hash: buildHash,
  });
});
