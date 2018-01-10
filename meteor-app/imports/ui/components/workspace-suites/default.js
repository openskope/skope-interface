import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import {
  LayerList,
} from '/imports/ui/components/layerlist';
// import {
//   Toolbar,
//   ToolbarGroup,
//   ToolbarSeparator,
//   ToolbarTitle,
// } from 'material-ui/Toolbar';
// import TextField from 'material-ui/TextField';
// import IconButton from 'material-ui/IconButton';
// import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
// import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
// import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
// import PauseIcon from 'material-ui/svg-icons/av/pause';

import {
  HorizontalResizer,
} from '/imports/ui/components/resizer';
import MapView from '/imports/ui/components/mapview';

import {
  PropPrinter,
} from '/imports/ui/helpers';

import SuiteBaseClass from './SuiteBaseClass';

export default class Component extends SuiteBaseClass {

  static propTypes = SuiteBaseClass.extendPropTypes({
    status: PropTypes.string,
    description: PropTypes.string,
    dataExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
    yearStart: PropTypes.number.isRequired,
    yearEnd: PropTypes.number.isRequired,
    dataUrl: PropTypes.string.isRequired,
    layers: PropTypes.array.isRequired,
    metadata: PropTypes.object,
  });

  static defaultProps = {
    status: 'undefined',
    description: '',
    metadata: {},
  };

  constructor (props) {
    super(props);

    this.state = {
      activeTab: 'info',
      sidebarWidth: 400,
      sidebarMinWidth: 400,
      contentMinWidth: 400,
      layerVisibility: {},
      layerOpacity: {},
    };
  }

  setSidebarWidth = (newWidth) => {
    this.setState({
      sidebarWidth: newWidth,
    });
  };

  onTabChange = (nextTabValue) => this.setState({
    activeTab: nextTabValue,
  });

  getLayerVisibility = (layerId) => (
    layerId in this.state.layerVisibility
    ? this.state.layerVisibility[layerId]
    : true
  );
  setLayerVisibility = (layerId, isVisible) => this.setState({
    layerVisibility: {
      ...this.state.layerVisibility,
      [layerId]: isVisible,
    },
  });
  getLayerOpacity = (layerId) => (
    layerId in this.state.layerOpacity
    ? this.state.layerOpacity[layerId]
    : 1
  );
  setLayerOpacity = (layerId, opacity) => this.setState({
    layerOpacity: {
      ...this.state.layerOpacity,
      [layerId]: opacity,
    },
  });

  mapLayerRenderers = {
    wms (layer) {
      return (
        <map-layer-twms
          key={layer.id}
          name={layer.title}
          projection="EPSG:4326"
          extent={this.props.dataExtent}
          invisible={this.getLayerVisibility(layer.id) ? null : 'invisible'}
          opacity={this.getLayerOpacity(layer.id)}
          url={layer.endpoint}
          params={`LAYERS=${layer.layer}`}
          server-type="geoserver"
        />
      );
    },
  };

  renderMapLayer = (layer) => {
    if (!(layer.type in this.mapLayerRenderers)) {
      return null;
    }

    const mapLayerRenderer = this.mapLayerRenderers[layer.type];

    return mapLayerRenderer.call(this, layer);
  };

  render () {
    const {
      status,
      description,
      dataExtent,
      yearStart,
      yearEnd,
      dataUrl,
      layers,
      metadata,
    } = this.props;

    return (
      <div
        className="main-section"
        ref={(ref) => this._rootElement = ref}
      >
        <Paper
          transitionEnabled={false}
          className="side-panel"
          ref={(ref) => this._sidebarElement = ref}
          style={{
            width: this.state.sidebarWidth,
          }}
        >
          <Tabs
            contentContainerClassName="side-panel__content"
            value={this.state.activeTab}
            onChange={this.onTabChange}
          >
            <Tab
              label="Info"
              value="info"
            >
              <div className="side-panel__section">
                <p>Status: {status}</p>
                <p>Description: {description}</p>
                <p>Year: {yearStart} ~ {yearEnd}</p>
                <p>Download link(s)</p>
                <p>{dataUrl}</p>
              </div>
            </Tab>

            <Tab
              label="Layers"
              value="layers"
            >
              <LayerList
                className="side-panel__section"
                layers={
                  layers
                  // Add `id` property to the layers if not present.
                  .map((layer, index) => ({
                    id: index,
                    ...layer,
                  }))
                  .map((layer) => ({
                    ...layer,
                    invisible: !this.getLayerVisibility(layer.id),
                    opacity: this.getLayerOpacity(layer.id),
                  }))
                }
                onChangeLayerVisibility={this.setLayerVisibility}
                onChangeLayerOpacity={_.debounce(this.setLayerOpacity)}
              />
            </Tab>

            <Tab
              label="Metadata"
              value="metadata"
            >
              <div className="side-panel__section">
                <h2>Metadata</h2>
                <PropPrinter {...metadata} />
              </div>
            </Tab>
          </Tabs>
        </Paper>

        <HorizontalResizer
          targetCurrentWidth={() => this.state.sidebarWidth}
          targetMinWidth={() => this.state.sidebarMinWidth}
          targetMaxWidth={() => this._rootElement.clientWidth - this.state.contentMinWidth}
          targetWidthOnChange={this.setSidebarWidth}
        />

        <Paper
          transitionEnabled={false}
          className="main-content"
          style={{
            backgroundColor: 'white',
          }}
        >
          {this.state.activeTab === 'info' && (
            <MapView
              basemap="osm"
              projection="EPSG:4326"
              extent={dataExtent}
              style={{
                height: '100%',
                width: '100%',
              }}
            />
          )}
          {this.state.activeTab === 'layers' && (
            <MapView
              basemap="osm"
              projection="EPSG:4326"
              extent={dataExtent}
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              {layers.map((layer) => this.renderMapLayer(layer, this.props, this.state))}
              <map-interaction-defaults />
              <map-control-defaults />
            </MapView>
          )}
        </Paper>
      </div>
    );
  }
}
