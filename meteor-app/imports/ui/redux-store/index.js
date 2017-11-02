import PropTypes from 'prop-types';
// import { createStore } from 'meteor/zodiase:reactive-redux-store';
import { createStore } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';

import * as reducers from './reducers';
import * as actions from './actions';
import initialState from './initial-state';

const reducer = (state = initialState, action) => {
  console.log('run reducer', action.type, { state, action });

  let nextState = {
    ...state,
    // Insert reducer from `redux-form`.
    form: reduxFormReducer(state.form, action),
  };

  if (action.type in reducers) {
    PropTypes.checkPropTypes(actions[action.type].payloadSchema, action, 'action', `reducer:${action.type}`);

    nextState = reducers[action.type](nextState, action);
  }

  console.log('next state', nextState);

  return nextState;
};

const store = createStore(
  reducer,
  undefined,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

export default store;
export * as actions from './actions';
