export const WORKSPACE_CLOSE_WELCOME_WINDOW = (state, action) => {    
  return {
    ...state,

    workspace: {
      ...state.workspace,

      welcomeWindowClosed: true,
    },
  };
};
