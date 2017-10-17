/**
 * The charts page for the workspace page.
 */

import {
  connect,
} from 'react-redux';
import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';
import * as actions from '/imports/ui/actions';

import Component from './component';

export default connect(
  // mapStateToProps
  (state) => {
    const {
      charts: {
        inspectPointData,
        inspectPointDataRequest,
        filterMin,
        filterMax,
      },
    } = state;

    return {
      dataIsLoading: inspectPointDataRequest !== null,
      hasLoadedData: inspectPointData !== null,
      sources: Object.keys(inspectPointData ? inspectPointData.data : {}).map((sourceName) => ({
        label: sourceName,
        data: inspectPointData.data[sourceName]
              .filter((value, valueIndex) => (valueIndex >= filterMin && valueIndex <= filterMax))
              .map((value, valueIndex) => ({
                x: filterMin + valueIndex,
                y: value,
              })),
      })),
      filterMin,
      filterMax,
      rangeMin,
      rangeMax,
    };
  },
  // mapDispatchToProps
  (dispatch) => ({
    updateFilter: (value1, value2) => dispatch({
      type: actions.CHARTS_SET_FILTERS.type,
      value1,
      value2,
    }),
  }),
)(Component);
