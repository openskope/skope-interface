export const WORKSPACE_TOGGLE_PANEL_MENU= (state) => {
    return {
        ...state,

        workspace: {
            ...state.workspace,

            sidePanelMenuClosed: !state.workspace.sidePanelMenuClosed,
        },
    };
};