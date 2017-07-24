export const WORKSPACE_TOGGLE_WELCOME_WINDOW = (state) => {
  return {
    ...state,

    workspace: {
      ...state.workspace,

      welcomeWindowClosed: !state.workspace.welcomeWindowClosed,
    },
  };
};
