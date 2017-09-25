export const MODEL_UPDATE_FORM = (state, action) => {
  const {
    values,
  } = action;

  return {
    ...state,

    model: {
      ...state.model,

      inspectPointCoordinate: [
        isNaN(values.longitude) ? 0 : values.longitude,
        isNaN(values.latitude) ? 0 : values.latitude,
      ],
      predictionYears: isNaN(values.predictionYears) ? 0 : values.predictionYears,
      meanVar: values.meanVar,
      minWidth: isNaN(values.minWidth) ? 0 : values.minWidth,
    },
  };
};
