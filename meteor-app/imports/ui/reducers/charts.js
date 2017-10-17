/**
 * This reducer is used when a new point is selected for inspection in charts and the data is being requested.
 */
export const CHARTS_INSPECT_POINT_INIT_REQUEST = (
  state,
  {
    coordinate,
    requestId,
  },
) => ({
  ...state,

  charts: {
    ...state.charts,

    inspectPointDataRequest: {
      coordinate,
      requestId,
    },
  },
});

/**
 * This reducer is used when a new point is selected for inspection in charts and the data is ready.
 */
export const CHARTS_INSPECT_POINT_RESOLVE_DATA = (
  state,
  {
    error,
    result,
  },
) => {
  if (error) {
    //! Do something?
  } else {
    const {
      data,
      requestId,
    } = result;
    const {
      inspectPointDataRequest,
    } = state.charts;

    if (inspectPointDataRequest && inspectPointDataRequest.requestId === requestId) {
      return {
        ...state,

        charts: {
          ...state.charts,

          inspectPointData: data,
          inspectPointDataRequest: null,
        },
      };
    }
  }

  return state;
};

export const CHARTS_INSPECT_POINT_CLEAR_DATA = (state) => ({
  ...state,

  charts: {
    ...state.charts,

    inspectPointData: null,
    inspectPointDataRequest: null,
  },
});

/**
 * This reducer is used when filter value is changed.
 */
export const CHARTS_SET_FILTERS = (state, action) => {
  const {
    value1,
    value2,
  } = action;

  return {
    ...state,

    charts: {
      ...state.charts,

      filterMin: value1,
      filterMax: value2,
    },
  };
};
