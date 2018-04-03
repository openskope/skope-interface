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

    //! For testing only. Should be empty on start.
    layers: [
      {
        name: 'GDD may sept demosaic',
        wmsBaseUrl: 'http://141.142.170.103:8080/geoserver/skope/wms',
        wmsLayerName: 'GDD_may_sept_demosaic',
        minZoom: 5,
        maxZoom: 12,
        invisible: false,
        sidePanelMenuClosed: true,
        opacity: 0.7,
        extent: '-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904',
      },
      {
        name: 'PPT annual demosaic',
        wmsBaseUrl: 'http://141.142.170.103:8080/geoserver/skope/wms',
        wmsLayerName: 'PPT_annual_demosaic',
        minZoom: 5,
        maxZoom: 12,
        invisible: false,
        sidePanelMenuClosed: true,
        opacity: 0.7,
        extent: '-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904',
      },
      {
        name: 'PPT may sept demosaic',
        wmsBaseUrl: 'http://141.142.170.103:8080/geoserver/skope/wms',
        wmsLayerName: 'PPT_may_sept_demosaic',
        minZoom: 5,
        maxZoom: 12,
        invisible: true,
        sidePanelMenuClosed: true,
        opacity: 0.7,
        extent: '-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904',
      },
      {
        name: 'PPT water year',
        wmsBaseUrl: 'http://141.142.170.103:8080/geoserver/skope/wms',
        wmsLayerName: 'PPT_water_year',
        minZoom: 5,
        maxZoom: 12,
        invisible: true,
        sidePanelMenuClosed: true,
        opacity: 0.7,
        extent: '-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904',
      },
    ],

    filterValue: null,

    // Whether a point is selected for inspection.
    inspectPointSelected: false,
    // If a point is selected for inspection, this would be its coordinates in [long, lat] (this order).
    inspectPointCoordinate: [0, 0],

    welcomeWindowClosed: true,
    toolbarMenuClosed: true,
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
