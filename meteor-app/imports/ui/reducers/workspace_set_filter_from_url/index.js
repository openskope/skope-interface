/**
 * This reducer is used when filter value is changed.
 */

import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

export const WORKSPACE_SET_FILTER_FROM_URL = (state, action) => {
  const {
    value,
  } = action;

  let filterValue = typeof value === 'undefined' ? rangeMax : parseInt(value, 10);
  filterValue = isNaN(filterValue) ? rangeMin : filterValue;
  filterValue = Math.max(rangeMin, filterValue);
  filterValue = Math.min(filterValue, rangeMax);

  return {
    ...state,

    workspace: {
      ...state.workspace,

      filterValue,
    },
  };
};
