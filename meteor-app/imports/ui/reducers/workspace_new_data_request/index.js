/**
 * This reducer is used when a new data request is created in workspace.
 */

export const WORKSPACE_NEW_DATA_REQUEST = (state, action) => {
  const {
    request,
  } = action;

  return {
    ...state,

    workspace: {
      ...state.workspace,

      // Store the request.
      request,

      // Clear the errors and results.
      error: null,
      result: null,
    },
  };
};
