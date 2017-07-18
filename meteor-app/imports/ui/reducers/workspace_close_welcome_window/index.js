export const WORKSPACE_CLOSE_WELCOME_WINDOW = (state) => {
  return {
    ...state,

    workspace: {
      ...state.workspace,

      welcomeWindowClosed: true,
    },
  };
};
