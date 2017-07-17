/**
 * This reducer is used when a new point is selected for inspection in workspace and the data is ready.
 */

import _ from 'lodash';

export const WORKSPACE_INSPECT_POINT_RESOLVE_DATA = (state, action) => {
  const {
    coordinate,
    // error,
    result,
  } = action;

  if (state.workspace.inspectPointSelected && state.workspace.inspectPointLoading && _.isEqual(state.workspace.inspectPointCoordinate, coordinate)) {
    return {
      ...state,

      workspace: {
        ...state.workspace,

        inspectPointLoading: false,
        inspectPointData: result,
      },
    };
  }
  return state;
};
