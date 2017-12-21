import {
  Meteor,
} from 'meteor/meteor';
import uuidv4 from 'uuid/v4';
import store, { actions } from '/imports/ui/redux-store';
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

export const WORKSPACE_RESOLVE_DATASET_DATA = scopedReducer((workspace, action) => {
  let {
    configDataRequest,
    configDataRequestError,
    configData,
  } = workspace;

  if (
    configDataRequest
    && configDataRequest.requestId === action.requestId
    && configDataRequest.datasetId === action.datasetId
  ) {
    if (action.error) {
      //! handle error?

      configDataRequest = null;
      configDataRequestError = action.error;
      configData = null;
    } else {
      configDataRequest = null;
      configDataRequestError = null;
      configData = action.data;
    }
  }

  return {
    ...workspace,

    configDataRequest,
    configDataRequestError,
    configData,
  };
});

export const WORKSPACE_LOAD_DATASET = scopedReducer((workspace, action) => {
  const {
    datasetId: newDatasetId,
  } = action;
  let {
    datasetId,
    configDataRequest,
    configDataRequestError,
    configData,
  } = workspace;

  // Dataset ID could be empty, which means unloading dataset.
  if (newDatasetId) {
    // Load new dataset.
    const requestId = uuidv4();

    datasetId = newDatasetId;
    configDataRequest = {
      datasetId: newDatasetId,
      requestId,
    };
    configDataRequestError = null;
    configData = null;

    Meteor.call(
      'datasetManifest.get',
      {
        datasetId,
      },
      (error, data) => {
        store.dispatch({
          type: actions.WORKSPACE_RESOLVE_DATASET_DATA.type,
          datasetId,
          requestId,
          error,
          data,
        });
      },
    );
  } else {
    // Unload data.
    datasetId = '';
    configDataRequest = null;
    configDataRequestError = null;
    configData = null;
  }

  return {
    ...workspace,

    datasetId,
    configDataRequest,
    configDataRequestError,
    configData,

    // Reset state for the dynamic suite.
    DynamicSuiteNS: null,
  };
});

export const WORKSPACE_SET_SUITE_STATE = scopedReducer((workspace, action) => {
  const {
    state: newState,
    options = {},
  } = action;

  if (options.reset) {
    return {
      ...workspace,

      // Reset removes the existing states.
      DynamicSuiteNS: {
        ...newState,
      },
    };
  }

  // Mimic the same behavior of `React.Component.prototype.setState`,
  // which is merging states.
  return {
    ...workspace,
    
    DynamicSuiteNS: {
      ...workspace.DynamicSuiteNS,

      ...newState,
    },
  };
});
