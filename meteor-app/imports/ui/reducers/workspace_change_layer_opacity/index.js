/**
 * This reducer is used to change the opacity of a layer in workspace.
 */

export const WORKSPACE_CHANGE_LAYER_OPACITY = (state, action) => {
  const {
    index,
    opacity,
  } = action;

  return {
    ...state,

    workspace: {
      ...state.workspace,

      layers: state.workspace.layers.map((layer, layerIndex) => {
        if (layerIndex === index) {
          // Change the opacity of the layer.
          return {
            ...layer,

            opacity,
          };
        }
        return layer;
      }),
    },
  };
};
