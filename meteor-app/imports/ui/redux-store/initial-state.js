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
    // Stores the dataset document.
    dataset: null,
    // Namespace for any state the dynamic suite needs to store.
    // This should be reset whenever a new suite is used.
    DynamicSuiteNS: null,
  },
};
