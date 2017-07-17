/**
 * This reducer is used to toggle the visibility of a layer in workspace.
 */

export const WORKSPACE_TOGGLE_LAYER_VISIBILITY = (state, action) => {
  const {
    index,
    visible,
  } = action;

  const visibilityGiven = !(typeof visible === 'undefined');

  return {
    ...state,

    workspace: {
      ...state.workspace,

      layers: state.workspace.layers.map((layer, layerIndex) => {
        if (layerIndex === index) {
          // Toggle the visibility of the layer.
          return {
            ...layer,

            invisible: visibilityGiven ? (!visible) : (!layer.invisible),
          };
        }
        return layer;
      }),
    },
  };
};
