import React from 'react';
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

      toolbarMenuClosed,
      welcomeWindowClosed,

      titleName,
    },
  } = store.getState();

  return {
    layers: layers.map((layer, layerIndex) => ({
      ...layer,

      element: (
        <map-layer-group
          key={layerIndex}
        >
          <map-layer-twms
            name={layer.name}
            url={layer.wmsBaseUrl}
            min-zoom={layer.minZoom}
            max-zoom={layer.maxZoom}
            invisible={layer.invisible ? 'invisible' : null}
            sidePanelMenuClosed={layer.sidePanelMenuClosed ? 'sidePanelMenuClosed' : null}
            opacity={layer.opacity}
            extent={layer.extent}
            params={`LAYERS=${layer.wmsLayerName}${filterValue}&TILED=true`}
            server-type="geoserver"
          />
          {!layer.nextUrl ? null : (
            <map-layer-twms
              name={`${layer.name} (preload)`}
              url={layer.wmsBaseUrl}
              min-zoom={layer.minZoom}
              max-zoom={layer.maxZoom}
              opacity="0"
              extent={layer.extent}
              params={`LAYERS=${layer.wmsLayerName}${filterValue + 1}&TILED=true`}
              server-type="geoserver"
            />
          )}
        </map-layer-group>
      ),
    })),
    toggleLayer: (layerIndex, visible) => {
      store.dispatch({
        type: actions.WORKSPACE_TOGGLE_LAYER_VISIBILITY.type,
        index: layerIndex,
        visible,
      });
    },
    updateLayerOpacity: (layerIndex, opacity) => {
      store.dispatch({
        type: actions.WORKSPACE_CHANGE_LAYER_OPACITY.type,
        index: layerIndex,
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
    updateFilterValue: (value) => {
      store.dispatch({
        type: actions.WORKSPACE_SET_FILTER.type,
        value,
      });
    },

    welcomeWindowClosed,
    toggleWelcomeWindow: () => {
      store.dispatch({
        type: actions.WORKSPACE_TOGGLE_WELCOME_WINDOW.type,
      });
    },


    toggleSideMenu: (layerIndex, invisible) => {
      store.dispatch({
        type: actions.WORKSPACE_TOGGLE_PANEL_MENU.type,
        index: layerIndex,
        invisible,
      });
    },

    toolbarMenuClosed,
    toggleToolbarMenu: () => {
      store.dispatch({
          type: actions.WORKSPACE_TOGGLE_TOOLBAR_MENU.type,
      })
    },

    titleName,
  };
}, Component);
