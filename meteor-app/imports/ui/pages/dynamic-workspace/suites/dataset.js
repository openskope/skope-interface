import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import objectPath from 'object-path';
import geojsonExtent from 'geojson-extent';

import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
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

import MapView from '/imports/ui/components/mapview';

import {
  DatasetInfoIcon,
  DatasetDownloadIcon,
  DatasetMapIcon,
  DatasetChartIcon,
  DatasetModelIcon,
} from '/imports/ui/consts';

import {
  buildGeoJsonWithGeometry,
  MarkDownRenderer,
} from '/imports/ui/helpers';

import SuiteBaseClass from './SuiteBaseClass';

export default class Component extends SuiteBaseClass {

  static propTypes = SuiteBaseClass.extendPropTypes({
    // status: PropTypes.string,
    // description: PropTypes.string,
    // dataExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
    // yearStart: PropTypes.number.isRequired,
    // yearEnd: PropTypes.number.isRequired,
    // dataUrl: PropTypes.string.isRequired,
    // layers: PropTypes.array.isRequired,
    // metadata: PropTypes.object,
  });

  static defaultProps = {
    // status: 'undefined',
    // description: '',
    // metadata: {},
  };

  static defaultLayerVisibility = false;

  static defaultLayerOpacity = 1;

  /**
   * @param {string} urlTemplate
   * @param {Object.<placeHolder: string, value: *} values
   * @returns {string}
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
    /**
     * @param {Object} layer
     * @param {string} layer.id
     * @param {string} layer.title
     * @param {string} layer.title
     * @returns {ReactElement}
     */
    wms (layer) {
      return (
        <map-layer-twms
          key={layer.id}
          name={layer.title}
          projection="EPSG:4326"
          extent={this.getDatasetExtent()}
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
      // @type {Object.<layerId: string, visible: boolean>}
      layerVisibility: {},
      // @type {Object.<layerId: string, opacity: number>}
      layerOpacity: {},
      // @type {number}
      currentLoadedYear: props.timespan.period.lte,
    };
  }

  onTabChange = (nextTabValue) => {
    this.setState({
      activeTab: nextTabValue,
    });

    // Tab switch is not done yet, wait next frame.
    _.defer(() => {
      window.dispatchEvent(new CustomEvent('resize'));
    });
  };

  /**
   * Returns true if the layer is visible.
   * @param {boolean} layerId
   * @returns {boolean}
   */
  getLayerVisibility = (layerId) => (
    layerId in this.state.layerVisibility
    ? this.state.layerVisibility[layerId]
    : this.constructor.defaultLayerVisibility
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
    : this.constructor.defaultLayerOpacity
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

  /**
   * @returns {Array.<number>}
   */
  getDatasetExtent = () => {
    const {
      region,
    } = this.props;

    // If `extents` is specified in source, trust that. Otherwise try to calculate from boundary shape.

    const boundaryExtentFromDocument = objectPath.get(region, 'extents');

    if (boundaryExtentFromDocument) {
      return boundaryExtentFromDocument.map((s) => parseFloat(s));
    }

    const boundaryGeoJson = this.getDatasetBoundaryGeoJson();

    if (!boundaryGeoJson) {
      return null;
    }

    return geojsonExtent(boundaryGeoJson);
  };

  /**
   * @returns {Object}
   */
  getDatasetBoundaryGeoJson = () => {
    const boundaryGeometry = objectPath.get(this.props.region, 'geometry');

    if (!boundaryGeometry) {
      return null;
    }

    return buildGeoJsonWithGeometry(boundaryGeometry);
  };

  renderTabLabel = ({
    IconComponent,
    label,
  }) => (
    <div className="tab-label">
      <IconComponent
        style={{
          color: 'inherit',
        }}
      />
      <span>{label}</span>
    </div>
  );

  renderMapLayer = (layer) => {
    if (!(layer.type in Component.mapLayerRenderers)) {
      return null;
    }

    const mapLayerRenderer = Component.mapLayerRenderers[layer.type];

    return mapLayerRenderer.call(this, layer);
  };

  renderInfoTab = () => {
    const {
      information: informationField,
    } = this.props;

    if (!informationField) {
      return null;
    }

    const boundaryGeoJson = this.getDatasetBoundaryGeoJson();
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.getDatasetExtent();

    return (
      <Tab
        label={this.renderTabLabel({
          IconComponent: DatasetInfoIcon,
          label: 'Info',
        })}
        value="info"
      >
        <div className="dataset__info-tab">
          <Paper
            className="info__markdown"
            zDepth={5}
          >
            <MarkDownRenderer
              value={informationField.markdown}
            />
          </Paper>

          <Paper
            className="info__map"
            zDepth={0}
          >
            <MapView
              basemap="osm"
              projection="EPSG:4326"
              extent={boundaryExtent}
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              {boundaryGeoJsonString && (
                <map-layer-geojson src-json={boundaryGeoJsonString} />
              )}
            </MapView>
          </Paper>
        </div>
      </Tab>
    );
  };

  renderDownloadTab = () => {
    const {
      downloadService: downloadField,
    } = this.props;

    if (!downloadField) {
      return null;
    }

    return (
      <Tab
        label={this.renderTabLabel({
          IconComponent: DatasetDownloadIcon,
          label: 'Download',
        })}
        value="download"
      >
        <div className="dataset__download-tab">
          <Paper
            className="download__markdown"
            zDepth={5}
          >
            <MarkDownRenderer
              value={downloadField.markdown}
            />
          </Paper>
        </div>
      </Tab>
    );
  };

  renderLayersTab = () => {
    const {
      yearStart,
      yearEnd,
      overlays: layers,
    } = this.props;

    const toolbarTooltipPosition = 'top-center';

    const boundaryGeoJson = this.getDatasetBoundaryGeoJson();
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.getDatasetExtent();

    return (
      <Tab
        label={this.renderTabLabel({
          IconComponent: DatasetMapIcon,
          label: 'Overlays',
        })}
        value="layers"
      >
        <div className="dataset__overlay-tab">
          <Paper
            className="overlay__controls"
            zDepth={1}
          >
            <Subheader>Layers</Subheader>
            <LayerList
              layers={
                layers
                // Add `id` property to the layers if not present.
                .map((layer, index) => ({
                  id: index,
                  ...layer,
                }))
                .map((layer) => ({
                  id: layer.id,
                  title: layer.name,
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
              </ToolbarGroup>
            </Toolbar>
          </Paper>

          <Paper
            className="overlay__map"
            zDepth={0}
          >
            <MapView
              basemap="osm"
              projection="EPSG:4326"
              extent={boundaryExtent}
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              {boundaryGeoJsonString && (
                <map-layer-geojson src-json={boundaryGeoJsonString} />
              )}
              <map-interaction-defaults />
              <map-control-defaults />
            </MapView>
          </Paper>
        </div>
      </Tab>
    );
  };

  //! Change this to show charts placeholders.
  renderAnalyticsTab = () => {
    const {
      analyticService: analyticsField,
    } = this.props;

    if (!analyticsField) {
      return null;
    }

    return (
      <Tab
        label={this.renderTabLabel({
          IconComponent: DatasetChartIcon,
          label: 'Analytics',
        })}
        value="analytics"
      >
        <div className="dataset__analytics-tab">
          <Paper
            className="analytics__controls"
            zDepth={5}
          >
            <MarkDownRenderer
              value={analyticsField.markdown}
            />
          </Paper>
          <Paper
            className="analytics__charts"
            zDepth={0}
          />
        </div>
      </Tab>
    );
  };

  renderModelTab = () => {
    const {
      modelService: modelField,
    } = this.props;

    if (!modelField) {
      return null;
    }

    return (
      <Tab
        label={this.renderTabLabel({
          IconComponent: DatasetModelIcon,
          label: 'Model',
        })}
        value="model"
      >
        <div className="dataset__model-tab">
          <Paper
            className="model__markdown"
            zDepth={5}
          >
            <MarkDownRenderer
              value={modelField.markdown}
            />
          </Paper>
        </div>
      </Tab>
    );
  };

  renderMetadataTab = () => {
    const {
      metadata: metadataField,
    } = this.props;

    if (!metadataField) {
      return null;
    }

    return (
      <Tab
        label="Metadata"
        value="metadata"
      >
        <div className="dataset__metadata-tab">
          <Paper
            className="metadata__markdown"
            zDepth={5}
          >
            <MarkDownRenderer
              value={metadataField.markdown}
            />
          </Paper>
        </div>
      </Tab>
    );
  };

  render () {
    return (
      <Paper
        className="suite-wrapper"
      >
        <Tabs
          className="tabs-panel"
          contentContainerClassName="tabs-panel__content"
          value={this.state.activeTab}
          onChange={this.onTabChange}
        >
          {this.renderInfoTab()}
          {this.renderDownloadTab()}
          {this.renderLayersTab()}
          {this.renderAnalyticsTab()}
          {this.renderModelTab()}
          {this.renderMetadataTab()}
        </Tabs>
      </Paper>
    );
  }
}
