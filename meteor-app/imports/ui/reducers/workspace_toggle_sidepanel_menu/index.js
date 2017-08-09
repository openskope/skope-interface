export const WORKSPACE_TOGGLE_PANEL_MENU= (state, action) => {
    const {
        index,
        invisible,
    } = action;

    const invisibilityGiven = !(typeof invisible === 'undefined');

    return {
        ...state,

        workspace: {
            ...state.workspace,

            layers: state.workspace.layers.map((layer, layerIndex) => {
                if (layerIndex === index) {
                    // Toggle the visibility of the layer.
                    return {
                        ...layer,

                        sidePanelMenuClosed: invisibilityGiven ? (!invisible) : (!layer.sidePanelMenuClosed),
                    };
                }
                return layer;
            }),

        },
    };
};