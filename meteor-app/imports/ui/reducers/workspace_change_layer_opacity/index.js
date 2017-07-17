/**
 * This reducer is used to change the opacity of a layer in workspace.
 */

export const WORKSPACE_CHANGE_LAYER_OPACITY = (state, action) => {
  const {
    opacity,
  } = action;

  return {
    ...state,

    workspace: {
      ...state.workspace,

      layerOpacity: opacity,
    },
  };
};
