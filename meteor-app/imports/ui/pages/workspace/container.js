import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import {
  filterMin,
  filterMax,
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
      inspectPointLoading,
      inspectPointData,

      filterValue,
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
      )
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
    inspectPointLoading,
    inspectPointData: Object.keys(inspectPointData ? inspectPointData.data : {}).map(sourceName => ({
      label: sourceName,
      data: inspectPointData.data[sourceName]
            .filter((value, valueIndex) => valueIndex >= filterValue)
            .map((value, valueIndex) => ({
              x: filterValue + valueIndex,
              y: value,
            })),
    })),
    selectInspectPoint: (coord) => {
      if (coord) {
        store.dispatch({
          type: actions.WORKSPACE_INSPECT_POINT.type,
          selected: true,
          coordinate: coord,
        });

        Meteor.call('timeseries.get', { lon: coord[0], lat: coord[1] }, (error, result) => {
          store.dispatch({
            type: actions.WORKSPACE_INSPECT_POINT_RESOLVE_DATA.type,
            coordinate: coord,
            error,
            result,
          });
        });
      } else {
        store.dispatch({
          type: actions.WORKSPACE_INSPECT_POINT.type,
          selected: false,
          coordinate: [0, 0],
        });
      }
    },

    filterMin,
    filterMax,
    filterValue,
  };
}, Component);
