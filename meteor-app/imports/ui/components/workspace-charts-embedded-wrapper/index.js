import { Meteor } from 'meteor/meteor';
import {
  connect,
} from 'react-redux';
import uuidv4 from 'uuid/v4';

import * as actions from '/imports/ui/actions';

import Component from './component';

export default connect(
  // mapStateToProps
  (state) => {
    const {
      workspace: {
        inspectPointSelected,
        inspectPointCoordinate,
      },
    } = state;

    return {
      inspectPointSelected,
      inspectPointCoordinate,
    };
  },
  // mapDispatchToProps
  (dispatch) => ({
    /**
     * @param  {Array.<number>} coordinate
     */
    loadDataForPoint: (coordinate) => {
      const requestId = uuidv4();

      dispatch({
        type: actions.CHARTS_INSPECT_POINT_INIT_REQUEST.type,
        requestId,
        coordinate,
      });

      Meteor.call('timeseries.get', {
        lon: coordinate[0],
        lat: coordinate[1],
        requestId,
      }, (error, result) => {
        dispatch({
          type: actions.CHARTS_INSPECT_POINT_RESOLVE_DATA.type,
          error,
          result,
        });
      });
    },
    clearLoadedData: () => dispatch({
      type: actions.CHARTS_INSPECT_POINT_CLEAR_DATA.type,
    }),
  }),
)(Component);
