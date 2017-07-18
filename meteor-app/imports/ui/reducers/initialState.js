import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

export default {
  navInfo: [],

  search: {
    // @type {string} - search string.
    input: '',
    // @type {boolean} - whether the results are being loaded.
    pending: false,
    // @type {object|null} - search result object.
    results: null,
  },

  workspace: {
    //! For testing only. Should be empty on start.
    layers: [
      {
        name: 'Water-year Precipitation',
        urlTile: 'PPT_water_year',
        minZoom: 5,
        maxZoom: 12,
        invisible: false,
        opacity: 0.7,
        extent: '-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904',
      },
      {
        name: 'Fahrenheit GDD',
        urlTile: 'GDD_may_sept_demosaic',
        minZoom: 5,
        maxZoom: 12,
        invisible: false,
        opacity: 0.7,
        extent: '-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904',
      },
    ],

    filterValue: null,
    // Whether a point is selected for inspection.
    inspectPointSelected: false,
    // If a point is selected for inspection, this would be its coordinates in [long, lat] (this order).
    inspectPointCoordinate: [0, 0],
  },

  charts: {
    // If a point is selected for inspection, this would be its coordinates in lat-long.
    inspectPointCoordinate: [0, 0],
    // If a point is selected for inspection, this shows if data is still being loaded.
    inspectPointLoading: true,
    // If a point is selected for inspection, the loaded data will be stored here.
    inspectPointData: null,

    filterMin: rangeMin,
    filterMax: rangeMax,
  },
};
