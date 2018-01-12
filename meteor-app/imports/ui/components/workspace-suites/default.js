import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';

import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import {
  LayerList,
} from '/imports/ui/components/layerlist';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
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

  /**
   * @param {string} urlTemplate
   * @param {Object.<placeHolder: string, value: *} values
   * @return {string}
   */
  static composeLayerId = (urlTemplate, values) => {
    return Object.keys(values)
      .reduce((urlStr, placeHolder) => {
        const value = values[placeHolder];
        const placeHolderStr = `{${placeHolder}}`;

        return urlStr.replace(placeHolderStr, value);
      }, urlTemplate);
  };

  static mapLayerRenderers = {
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
          params={`LAYERS=${Component.composeLayerId(layer.layer, {
            //! Maybe `moment` can fill this in a single step?
            fullyear: moment(this.state.currentLoadedYear.toFixed(0), 'YYYY').format('YYYY'),
          })}`}
          server-type="geoserver"
        />
      );
    },
  };

  constructor (props) {
    super(props);

    this.state = {
      // @type {string}
      activeTab: 'info',
      sidebarWidth: 400,
      sidebarMinWidth: 400,
      contentMinWidth: 400,
      // @type {Object.<layerId: string, visible: boolean>}
      layerVisibility: {},
      // @type {Object.<layerId: string, opacity: number>}
      layerOpacity: {},
      // @type {number}
      currentLoadedYear: props.yearEnd,
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

  _changeLoadedYear (nextYear) {
    let nextLoadedYear = nextYear;
    nextLoadedYear = Math.max(this.props.yearStart, nextLoadedYear);
    nextLoadedYear = Math.min(this.props.yearEnd, nextLoadedYear);

    if (nextLoadedYear === this.state.currentLoadedYear) {
      return;
    }

    this.setState({
      currentLoadedYear: nextLoadedYear,
    });
  }

  _yearStepBackButtonOnClick = (/* event */) => {
    this._changeLoadedYear(this.state.currentLoadedYear - 1);
  };

  _yearStepForwardButtonOnClick = (/* event */) => {
    this._changeLoadedYear(this.state.currentLoadedYear + 1);
  };

  /**
   * @param {string} value
   */
  _yearInputOnChange = (event, value) => {
    if (isNaN(value)) {
      return;
    }

    this._changeLoadedYear(parseInt(value, 10));
  };

  renderMapLayer = (layer) => {
    if (!(layer.type in Component.mapLayerRenderers)) {
      return null;
    }

    const mapLayerRenderer = Component.mapLayerRenderers[layer.type];

    return mapLayerRenderer.call(this, layer);
  };

  renderInfoTab = () => {
    const {
      status,
      description,
      yearStart,
      yearEnd,
      dataUrl,
    } = this.props;

    return (
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
    );
  };

  renderLayersTab = () => {
    const {
      yearStart,
      yearEnd,
      layers,
    } = this.props;

    const toolbarTooltipPosition = 'top-center';

    return (
      <Tab
        label="Layers"
        value="layers"
      >
        <LayerList
          className="side-panel__section side-panel__section--flexible"
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

        <Toolbar
          style={{
            height: 48,
          }}
        >
          <ToolbarGroup>
            <ToolbarTitle text="Time" />

            <IconButton
              tooltip="Step back"
              tooltipPosition={toolbarTooltipPosition}
              disabled={this.state.currentLoadedYear <= yearStart}
              onClick={this._yearStepBackButtonOnClick}
            >
              <LeftArrowIcon />
            </IconButton>

            <TextField
              hintText="Year"
              type="text"
              style={{
                width: 50,
              }}
              inputStyle={{
                textAlign: 'center',
              }}
              value={this.state.currentLoadedYear}
              onChange={this._yearInputOnChange}
            />

            <IconButton
              tooltip="Step forward"
              tooltipPosition={toolbarTooltipPosition}
              disabled={this.state.currentLoadedYear >= yearEnd}
              onClick={this._yearStepForwardButtonOnClick}
            >
              <RightArrowIcon />
            </IconButton>

            <ToolbarSeparator />

            <IconButton
              tooltip="Play/Pause"
              tooltipPosition={toolbarTooltipPosition}
            >
              <PlayIcon />
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
      </Tab>
    );
  };

  renderMetadataTab = () => {
    const {
      metadata,
    } = this.props;

    return (
      <Tab
        label="Metadata"
        value="metadata"
      >
        <div className="side-panel__section">
          <h2>Metadata</h2>
          <PropPrinter {...metadata} />
        </div>
      </Tab>
    );
  };

  render () {
    const {
      dataExtent,
      layers,
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
            className="side-panel__tabs-panel"
            contentContainerClassName="side-panel__tab-content"
            value={this.state.activeTab}
            onChange={this.onTabChange}
          >
            {this.renderInfoTab()}
            {this.renderLayersTab()}
            {this.renderMetadataTab()}
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
              style={{
                height: '100%',
                width: '100%',
              }}
              onViewLoad={(event) => event.target.extent = dataExtent}
            >
              {layers.map((layer) => this.renderMapLayer(layer, this.props, this.state)).reverse()}
              <map-interaction-defaults />
              <map-control-defaults />
            </MapView>
          )}
        </Paper>
      </div>
    );
  }
}
