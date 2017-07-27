export const MODEL_TOGGLE_MAP = (state) => {
  return {
    ...state,

    model: {
      ...state.model,

      mapShown: !state.model.mapShown,
    },
  };
};
