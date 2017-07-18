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
