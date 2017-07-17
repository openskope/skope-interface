import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import {
  rangeMin,
  rangeMax,
} from '/imports/ui/consts';

import * as actions from '/imports/ui/actions';

import Component from './component';

export default createContainer((props) => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it.

  const {
    store,
  } = props;
  const {
    workspace: {
      layers,

      inspectPointSelected,
      inspectPointCoordinate,
      
      filterValue,
        
      welcomeWindowClosed,
      layerOpacity,
    },
  } = store.getState();

  return {
    layers: layers.map(layer => ({
      ...layer,
      //url: `http://demo.openskope.org/static_tiles/${layer.urlTile}/tiles/${layer.urlTile}-${filterValue}-color/{z}/{x}/{-y}.png`,
      //nextUrl: `http://demo.openskope.org/static_tiles/${layer.urlTile}/tiles/${layer.urlTile}-${filterValue + 1}-color/{z}/{x}/{-y}.png`,
      url: 'http://141.142.170.103:8080/geoserver/skope/wms',
    })),
    toggleLayer: (layerIndex, visible) => {
      store.dispatch({
        type: actions.WORKSPACE_TOGGLE_LAYER_VISIBILITY.type,
        index: layerIndex,
        visible,
      });
    },
      
    layerOpacity,
    updateLayerOpacity: (opacity) => {
      store.dispatch({
        type: actions.WORKSPACE_CHANGE_LAYER_OPACITY.type,
        opacity,
      });
    },

    inspectPointSelected,
    inspectPointCoordinate,
    selectInspectPoint: (coord) => {
      store.dispatch({
        type: actions.WORKSPACE_INSPECT_POINT.type,
        selected: true,
        coordinate: coord,
      });
    },

    filterValue,
    rangeMin,
    rangeMax,
      
    welcomeWindowClosed,
    closeWelcomeWindow: () => {
        store.dispatch({
          type: actions.WORKSPACE_CLOSE_WELCOME_WINDOW.type,
        });
    },
  };
}, Component);
