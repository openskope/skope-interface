export const WORKSPACE_TOGGLE_WELCOME_WINDOW = (state, action) => {
  const {
    value,
  } = action;

  return {
    ...state,

    workspace: {
      ...state.workspace,

      welcomeWindowClosed: !value,
    },
  };
};
