import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

import * as actions from '/imports/ui/actions';

import { createContainer } from 'meteor/react-meteor-data';
import Component from './component';

export default createContainer((props) => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it.

  const {
    store,
  } = props;
  const {
    charts: {
      inspectPointLoading,
      inspectPointData,

      filterMin,
      filterMax,
    },
  } = store.getState();

  return {
    inspectPointLoading,
    inspectPointData: Object.keys(inspectPointData ? inspectPointData.data : {}).map(sourceName => ({
      label: sourceName,
      data: inspectPointData.data[sourceName]
            .filter((value, valueIndex) => (valueIndex >= filterMin && valueIndex <= filterMax))
            .map((value, valueIndex) => ({
              x: filterMin + valueIndex,
              y: value,
            })),
    })),

    filterMin,
    updateFilterMin: (value) => {
      store.dispatch({
        type: actions.CHARTS_SET_FILTERS.type,
        value1: value,
        value2: filterMax,
      });
    },
    filterMax,
    updateFilterMax: (value) => {
      store.dispatch({
        type: actions.CHARTS_SET_FILTERS.type,
        value1: filterMin,
        value2: value,
      });
    },
    rangeMin,
    rangeMax,
  };
}, Component);
