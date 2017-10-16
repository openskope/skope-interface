/**
 * Workspace page.
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

const buildLayerElement = (layer, layerIndex, temporalIndex) => (
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
      params={`LAYERS=${layer.wmsLayerName}${temporalIndex}&TILED=true`}
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
        params={`LAYERS=${layer.wmsLayerName}${temporalIndex + 1}&TILED=true`}
        server-type="geoserver"
      />
    )}
  </map-layer-group>
);

export default connect(
  // mapStateToProps
  (state) => {
    const {
      workspace: {
        layers,
        inspectPointSelected,
        inspectPointCoordinate,
        filterValue,
        welcomeWindowClosed,
        toolbarMenuClosed,
        titleName,
      },
    } = state;

    return {
      layers: layers.map((layer, layerIndex) => ({
        ...layer,

        element: buildLayerElement(layer, layerIndex, filterValue),
      })),
      inspectPointSelected,
      inspectPointCoordinate,
      filterValue,
      rangeMin,
      rangeMax,
      welcomeWindowClosed,
      toolbarMenuClosed,
      titleName,
    };
  },
  // mapDispatchToProps
  (dispatch) => ({
    selectInspectPoint: (coordinate) => dispatch({
      type: actions.WORKSPACE_INSPECT_POINT.type,
      selected: true,
      coordinate,
    }),
    updateFilterValue: (value) => dispatch({
      type: actions.WORKSPACE_SET_FILTER.type,
      value,
    }),
  }),
)(Component);
