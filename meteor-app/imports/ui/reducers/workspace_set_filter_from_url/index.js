/**
 * This reducer is used when filter value is changed.
 */

import {
  rangeMax,
} from '/imports/ui/consts';

export const WORKSPACE_SET_FILTER_FROM_URL = (state, action) => {
  const {
    value,
  } = action;
  const filterValue = typeof value === 'undefined' ? rangeMax : parseInt(value, 10);

  return {
    ...state,

    workspace: {
      ...state.workspace,

      filterValue,
    },
  };
};
