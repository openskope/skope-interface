/**
 * This reducer is used when filter value is changed.
 */

export const WORKSPACE_SET_FILTER = (state, action) => {
  const {
    value,
  } = action;

  return {
    ...state,

    workspace: {
      ...state.workspace,

      filterValue: value,
    },
  };
};
