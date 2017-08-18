export const TOGGLE_GLOBAL_MENU = (state) => {
  return {
    ...state,

    globalMenuClosed: !state.globalMenuClosed,

  };
};