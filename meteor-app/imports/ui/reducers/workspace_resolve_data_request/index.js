/**
 * This reducer is used when a data request is resolved in workspace.
 */

import _ from "lodash";

export const WORKSPACE_RESOLVE_DATA_REQUEST = (state, action) => {
  const {
    request,
    error,
    result,
  } = action;

  // If the request is different from what is stored, ignore the results.
  if (!_.isEqual(state.workspace.request, request)) {
    return state;
  } else {
    return {
      ...state,

      workspace: {
        ...state.workspace,

        error: error || null,
        result,
      },
    };
  }
};
