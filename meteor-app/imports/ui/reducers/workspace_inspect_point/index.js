/**
 * This reducer is used when a new point is selected for inspection in workspace.
 */

export const WORKSPACE_INSPECT_POINT = (state, action) => {
  const {
    selected,
    coordinate,
  } = action;

  return {
    ...state,

    workspace: {
      ...state.workspace,

      inspectPointSelected: selected,
      inspectPointCoordinate: selected ? [coordinate[0], coordinate[1]] : [0, 0],
    },
  };
};
