export const WORKSPACE_SWITCH_WELCOME_WINDOW = (state, action) => {
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
