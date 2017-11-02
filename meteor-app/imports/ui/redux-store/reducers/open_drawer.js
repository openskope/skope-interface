export const OPEN_DRAWER = (state, action) => ({
  ...state,

  drawer: {
    ...state.drawer,

    isOpen: 'overrideWith' in action ? action.overrideWith : !state.drawer.isOpen,
  },
});
