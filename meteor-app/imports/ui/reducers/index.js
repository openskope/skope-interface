import PropTypes from "prop-types";
import { FlowRouter } from "meteor/kadira:flow-router";
import * as actions from "/imports/ui/actions";
import * as reducers from "./reducers";

const defaultState = {
  navInfo: [],
  workspace: {
    filterValue: null,
    error: null,
    result: null,
    request: null,
  },
};

export default (state = defaultState, action) => {
  console.log('run reducer', action.type, {state, action});

  let nextState = state;

  if (action.type in reducers) {
    PropTypes.checkPropTypes(actions[action.type].payloadSchema, action, "action", `reducer:${action.type}`);

    nextState = reducers[action.type](state, action);
  }

  console.log('next state', nextState);

  return nextState;
};
