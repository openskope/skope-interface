import PropTypes from 'prop-types';
import * as actions from '/imports/ui/actions';
import * as reducers from './reducers';

import initialState from './initialState';

export default (state = initialState, action) => {
  console.log('run reducer', action.type, { state, action });

  let nextState = state;

  if (action.type in reducers) {
    PropTypes.checkPropTypes(actions[action.type].payloadSchema, action, 'action', `reducer:${action.type}`);

    nextState = reducers[action.type](state, action);
  }

  console.log('next state', nextState);

  return nextState;
};
