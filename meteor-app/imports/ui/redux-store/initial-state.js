import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

export default {

  // The current path from the router.
  path: '',

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
    // Put states specific to search page here.
  },

  workspace: {
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

    // title name from user click search tile in search page, and this ia one of example.
    titleName: 'National Elevation Data (NED)',
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
