export const WORKSPACE_TOGGLE_TOOLBAR_MENU = (state) => {
    return {
        ...state,

        workspace: {
            ...state.workspace,

            toolbarMenuClosed: !state.workspace.toolbarMenuClosed,
        },
    };

};