import { createContainer } from 'meteor/react-meteor-data';

import * as actions from '/imports/ui/actions';

import Component from './component';

export default createContainer((props) => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it.

  const {
    store,
  } = props;
  const {
    model: {
      inspectPointSelected,
      inspectPointCoordinate,

      mapShown,
      predictionYears,
      meanVar,
      minWidth,
    },
  } = store.getState();

  return {
    inspectPointSelected,
    inspectPointCoordinate,
    selectInspectPoint: (coord) => {
      store.dispatch({
        type: actions.MODEL_INSPECT_POINT.type,
        selected: true,
        coordinate: coord,
      });
    },

    mapShown,
    toggleMap: () => {
      store.dispatch({
        type: actions.MODEL_TOGGLE_MAP.type,
      });
    },

    predictionYears,
    meanVar,
    minWidth,
    updateForm: (values) => {
      store.dispatch({
        type: actions.MODEL_UPDATE_FORM.type,
        values,
      });
    },
  };
}, Component);
