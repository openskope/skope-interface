/**
 * This reducer is used when filter value is changed.
 */

import { filterMax } from "/imports/ui/consts";

export const WORKSPACE_SET_FILTER_FROM_URL = (state, action) => {
  const {
    value,
  } = action;
  const filterValue = value ? parseInt(value) : filterMax;

  return {
    ...state,
    workspace: {
      ...state.workspace,
      filterValue,
    },
  };
};
