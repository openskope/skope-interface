/**
 * This reducer is used when a new point is selected for inspection in charts and the data is ready.
 */

export const CHARTS_INSPECT_POINT_RESOLVE_DATA = (state, action) => {
  const {
    // coordinate,
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
