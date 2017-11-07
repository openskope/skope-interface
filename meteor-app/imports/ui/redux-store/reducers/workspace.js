import {
  scopedReducerCreator,
} from '/imports/ui/redux-store/helpers';
import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

/**
 * Restricts the scope of the reducer to a certain field in the state.
 * @param  {Function} reducer
 * @return {Function}
 */
const scopedReducer = (reducer) => scopedReducerCreator('workspace', reducer);

/**
 * This reducer is used to change the opacity of a layer in workspace.
 */
export const WORKSPACE_CHANGE_LAYER_OPACITY = scopedReducer((workspace, action) => {
  const {
    index,
    opacity,
  } = action;

  return {
    ...workspace,

    layers: workspace.layers.map((layer, layerIndex) => {
      if (layerIndex === index) {
        // Change the opacity of the layer.
        return {
          ...layer,

          opacity,
        };
      }
      return layer;
    }),
  };
});

/**
 * This reducer is used when a new point is selected for inspection in workspace.
 */
export const WORKSPACE_INSPECT_POINT = scopedReducer((workspace, action) => {
  const {
    selected,
    coordinate,
  } = action;

  return {
    ...workspace,

    inspectPointSelected: selected,
    inspectPointCoordinate: selected ? [coordinate[0], coordinate[1]] : [0, 0],
  };
});

/**
 * This reducer is used when filter value is changed.
 */
export const WORKSPACE_SET_FILTER = scopedReducer((workspace, action) => {
  const {
    value,
  } = action;

  return {
    ...workspace,

    filterValue: value,
  };
});

/**
 * This reducer is used when filter value is changed.
 */
export const WORKSPACE_SET_FILTER_FROM_URL = scopedReducer((workspace, action) => {
  const {
    value,
  } = action;

  let filterValue = typeof value === 'undefined' ? rangeMax : parseInt(value, 10);
  filterValue = isNaN(filterValue) ? rangeMin : filterValue;
  filterValue = Math.max(rangeMin, filterValue);
  filterValue = Math.min(filterValue, rangeMax);

  return {
    ...workspace,

    filterValue,
  };
});

/**
 * This reducer is used to toggle the visibility of a layer in workspace.
 */
export const WORKSPACE_TOGGLE_LAYER_VISIBILITY = scopedReducer((workspace, action) => {
  const {
    index,
    visible,
  } = action;

  const visibilityGiven = !(typeof visible === 'undefined');

  return {
    ...workspace,

    layers: workspace.layers.map((layer, layerIndex) => {
      if (layerIndex === index) {
        // Toggle the visibility of the layer.
        return {
          ...layer,

          invisible: visibilityGiven ? (!visible) : (!layer.invisible),
        };
      }
      return layer;
    }),
  };
});

export const WORKSPACE_TOGGLE_PANEL_MENU = scopedReducer((workspace, action) => {
  const {
    index,
    invisible,
  } = action;

  const invisibilityGiven = !(typeof invisible === 'undefined');

  return {
    ...workspace,

    layers: workspace.layers.map((layer, layerIndex) => {
      if (layerIndex === index) {
        // Toggle the visibility of the layer.
        return {
          ...layer,

          sidePanelMenuClosed: invisibilityGiven ? (!invisible) : (!layer.sidePanelMenuClosed),
        };
      }
      return layer;
    }),
  };
});

export const WORKSPACE_TOGGLE_TOOLBAR_MENU = scopedReducer((workspace) => {
  return {
    ...workspace,

    toolbarMenuClosed: !workspace.toolbarMenuClosed,
  };
});

export const WORKSPACE_TOGGLE_WELCOME_WINDOW = scopedReducer((workspace) => {
  return {
    ...workspace,

    welcomeWindowClosed: !workspace.welcomeWindowClosed,
  };
});
