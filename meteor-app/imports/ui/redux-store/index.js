import PropTypes from 'prop-types';
import { createStore } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';

import Raven from '/imports/startup/client/sentry';
import {
  appSettings,
} from '/package.json';

import * as reducers from './reducers';
import * as actions from './actions';
import initialState from './initial-state';

const reducer = (state = initialState, action) => {
  let nextState = state;

  try {
    nextState = {
      ...nextState,
      // Insert reducer from `redux-form`.
      form: reduxFormReducer(nextState.form, action),
    };

    if (action.type in reducers) {
      PropTypes.checkPropTypes(actions[action.type].payloadSchema, action, 'action', `reducer:${action.type}`);

      nextState = reducers[action.type](nextState, action);
    }

    if (Raven.isSetup()) {
      Raven.captureBreadcrumb({
        message: 'New action',
        category: 'redux action',
        data: {
          action,
        },
      });
    }
  } catch (e) {
    if (Raven.isSetup()) {
      Raven.captureException(e, {
        logger: 'redux',
        extra: {
          state,
          action,
        },
      });
    } else {
      throw e;
    }
  }

  return nextState;
};

const store = createStore(
  reducer,
  undefined,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

if (appSettings.exposeStoreToGlobal) {
  window.store = store;
}

export default store;
export * as actions from './actions';
