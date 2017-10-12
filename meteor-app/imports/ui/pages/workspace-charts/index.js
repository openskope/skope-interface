/**
 * The charts page for the workspace page.
 */

import React from 'react';
import {
  connect,
} from 'react-redux';
import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';
import * as actions from '/imports/ui/actions';

import Component from './component';
import './style.css';

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const {
      charts: {
        inspectPointLoading,
        inspectPointData,
        filterMin,
        filterMax,
      },
    } = state;

    return {
      inspectPointLoading,
      inspectPointData: Object.keys(inspectPointData ? inspectPointData.data : {}).map((sourceName) => ({
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
  (dispatch, ownProps) => ({
    updateFilter: (value1, value2) => dispatch({
      type: actions.CHARTS_SET_FILTERS.type,
      value1,
      value2,
    }),
  }),
)(Component);
