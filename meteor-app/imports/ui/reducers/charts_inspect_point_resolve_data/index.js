/**
 * This reducer is used when a new point is selected for inspection in workspace and the data is ready.
 */

import _ from 'lodash';

export const CHARTS_INSPECT_POINT_RESOLVE_DATA = (state, action) => {
  const {
    coordinate,
    // error,
    result,
  } = action;

  if (state.charts.inspectPointLoading) {
    return {
      ...state,

      charts: {
        ...state.charts,
    
        inspectPointLoading: false,
        inspectPointData: result,
      },
    };
  }
  return state;
};
