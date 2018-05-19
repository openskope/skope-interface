import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

export default {

  // The current path from the router.
  path: '',

  routing: {
    params: null,
    queryParams: null,
  },

  // Stuff related to the (global) drawer.
  drawer: {
    /**
     * Determines if the drawer is open.
     * @type {Boolean}
     */
    isOpen: false,
  },

  navInfo: [],

  // Url for the global help button.
  helpUrl: '',

  search: {
    // Store a copy of the search result from SearchKit to be used by other components.
    searchResult: null,
    // Put states specific to search page here.
  },

  workspace: {
    // The ID of the dataset currently loaded or is being loaded.
    datasetId: '',
    // If a request is pending, this will be an object with at least a unique request ID.
    configDataRequest: null,
    // Stores any error encountered during requesting the config data.
    configDataRequestError: null,
    // Stores the config data.
    configData: null,
    // Namespace for any state the dynamic suite needs to store.
    // This should be reset whenever a new suite is used.
    DynamicSuiteNS: null,
  },

  model: {
    // Whether a point is selected for inspection.
    inspectPointSelected: false,
    // If a point is selected for inspection, this would be its coordinates in [long, lat] (this order).
    inspectPointCoordinate: [0, 0],

    mapShown: false,
    predictionYears: rangeMax,
    meanVar: '',
    minWidth: 0,
  },

  charts: {
    // If a point is selected for inspection, the loaded data will be stored here.
    inspectPointData: null,
    // If a request is pending, this will be an object with at least a unique request ID.
    inspectPointDataRequest: null,

    filterMin: rangeMin,
    filterMax: rangeMax,
  },
};
