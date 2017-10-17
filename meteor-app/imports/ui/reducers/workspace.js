import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

/**
 * This reducer is used to change the opacity of a layer in workspace.
 */
export const WORKSPACE_CHANGE_LAYER_OPACITY = (state, action) => {
  const {
    index,
    opacity,
  } = action;

  return {
    ...state,

    workspace: {
      ...state.workspace,

      layers: state.workspace.layers.map((layer, layerIndex) => {
        if (layerIndex === index) {
          // Change the opacity of the layer.
          return {
            ...layer,

            opacity,
          };
        }
        return layer;
      }),
    },
  };
};

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

/**
 * This reducer is used when filter value is changed.
 */
export const WORKSPACE_SET_FILTER = (state, action) => {
  const {
    value,
  } = action;

  return {
    ...state,

    workspace: {
      ...state.workspace,

      filterValue: value,
    },
  };
};

/**
 * This reducer is used when filter value is changed.
 */
export const WORKSPACE_SET_FILTER_FROM_URL = (state, action) => {
  const {
    value,
  } = action;

  let filterValue = typeof value === 'undefined' ? rangeMax : parseInt(value, 10);
  filterValue = isNaN(filterValue) ? rangeMin : filterValue;
  filterValue = Math.max(rangeMin, filterValue);
  filterValue = Math.min(filterValue, rangeMax);

  return {
    ...state,

    workspace: {
      ...state.workspace,

      filterValue,
    },
  };
};

/**
 * This reducer is used to toggle the visibility of a layer in workspace.
 */
export const WORKSPACE_TOGGLE_LAYER_VISIBILITY = (state, action) => {
  const {
    index,
    visible,
  } = action;

  const visibilityGiven = !(typeof visible === 'undefined');

  return {
    ...state,

    workspace: {
      ...state.workspace,

      layers: state.workspace.layers.map((layer, layerIndex) => {
        if (layerIndex === index) {
          // Toggle the visibility of the layer.
          return {
            ...layer,

            invisible: visibilityGiven ? (!visible) : (!layer.invisible),
          };
        }
        return layer;
      }),
    },
  };
};

export const WORKSPACE_TOGGLE_PANEL_MENU = (state, action) => {
  const {
    index,
    invisible,
  } = action;

  const invisibilityGiven = !(typeof invisible === 'undefined');

  return {
    ...state,

    workspace: {
      ...state.workspace,

      layers: state.workspace.layers.map((layer, layerIndex) => {
        if (layerIndex === index) {
          // Toggle the visibility of the layer.
          return {
            ...layer,

            sidePanelMenuClosed: invisibilityGiven ? (!invisible) : (!layer.sidePanelMenuClosed),
          };
        }
        return layer;
      }),
    },
  };
};

export const WORKSPACE_TOGGLE_TOOLBAR_MENU = (state) => {
  return {
    ...state,

    workspace: {
      ...state.workspace,

      toolbarMenuClosed: !state.workspace.toolbarMenuClosed,
    },
  };
};

export const WORKSPACE_TOGGLE_WELCOME_WINDOW = (state) => {
  return {
    ...state,

    workspace: {
      ...state.workspace,

      welcomeWindowClosed: !state.workspace.welcomeWindowClosed,
    },
  };
};
