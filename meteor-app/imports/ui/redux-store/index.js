import PropTypes from 'prop-types';
import { createStore } from 'meteor/zodiase:reactive-redux-store';

import * as reducers from './reducers';
import * as actions from './actions';
import initialState from './initial-state';

const reducer = (state = initialState, action) => {
  console.log('run reducer', action.type, { state, action });

  let nextState = state;

  if (action.type in reducers) {
    PropTypes.checkPropTypes(actions[action.type].payloadSchema, action, 'action', `reducer:${action.type}`);

    nextState = reducers[action.type](state, action);
  }

  console.log('next state', nextState);

  return nextState;
};

export default createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export * as actions from './actions';
