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
  List,
  ListItem,
} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Slider from 'material-ui/Slider';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';

import MapView from '/imports/ui/components/mapview';

import {
  DatasetInfoIcon,
  DatasetDownloadIcon,
  DatasetMapIcon,
  DatasetChartIcon,
  DatasetModelIcon,
} from '/imports/ui/consts';

import {
  absoluteUrl,
  getDateAtPrecision,
  offsetDateAtPrecision,
  getPrecisionByResolution,
  getDateStringAtPrecision,
  parseDateStringWithPrecision,
  buildGeoJsonWithGeometry,
  MarkDownRenderer,
} from '/imports/ui/helpers';

import SuiteBaseClass from './SuiteBaseClass';

export default class Component extends SuiteBaseClass {

  static propTypes = SuiteBaseClass.extendPropTypes({
    timespan: PropTypes.shape({
      resolution: PropTypes.string,
      period: PropTypes.shape({
        gte: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.instanceOf(Date),
        ]),
        lte: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.instanceOf(Date),
        ]),
      }),
    }),
    overlays: PropTypes.arrayOf(PropTypes.shape({
       name: PropTypes.string,
       description: PropTypes.string,
       type: PropTypes.string,
       url: PropTypes.string,
       min: PropTypes.number,
       max: PropTypes.number,
       styles: PropTypes.arrayOf(PropTypes.string),
    })),
    // status: PropTypes.string,
    // description: PropTypes.string,
    // dataExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
    // dataUrl: PropTypes.string.isRequired,
    // layers: PropTypes.array.isRequired,
    // metadata: PropTypes.object,
  });

  static defaultProps = {
    timespan: null,
    overlays: null,
    // status: 'undefined',
    // description: '',
    // metadata: {},
  };

  static paddingForSliders = {
    paddingLeft: '8px',
    paddingRight: '8px',
  };

  static defaultLayerVisibility = false;

  static defaultLayerOpacity = 1;

  static opacitySliderMin = 0;
  static opacitySliderMax = 255;

  static getDisplayTextForLayerOpacity = (opacity) => opacity.toFixed(2);

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

  /**
   * Set of functions to render the element for the given layer type.
   * `this` inside these functions will be the class instance.
   * @type {Object<string, Function>}
   */
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
          url={this.fillOverlayUrl(layer.url)}
          server-type="geoserver"
        />
      );
    },
  };

  /**
   * Set of functions to calculate the values that should replace
   * their corresponding placeholders.
   * `this` inside these functions will be the class instance.
   * @type {Object<string, Function>}
   */
  static overlayUrlFillers = {
    YYYY () {
      const currentDate = this.state.currentLoadedDate;

      return moment(currentDate).format('YYYY');
    },
    MM () {
      const currentDate = this.state.currentLoadedDate;

      return moment(currentDate).format('MM');
    },
    DD () {
      const currentDate = this.state.currentLoadedDate;

      return moment(currentDate).format('DD');
    },
  };

  constructor (props) {
    super(props);

    const timespan = this.getDatasetTimespan();

    this.state = {
      // @type {string}
      activeTab: 'info',
      // @type {Object.<layerId: string, visible: boolean>}
      layerVisibility: {},
      // @type {Object.<layerId: string, opacity: number>}
      layerOpacity: {},
      // @type {string}
      timespanResolution: timespan.resolution,
      // @type {{gte: Date, lte: Date}}
      timespanPeriod: timespan.period,
      // @type {Date}
      currentLoadedDate: timespan.period.lte,
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

  getOpacitySliderValueForLayer = (layerId) => {
    const opacity = this.getLayerOpacity(layerId);
    const sliderValue = (opacity * (Component.opacitySliderMax - Component.opacitySliderMin)) + Component.opacitySliderMin;

    return sliderValue;
  };

  setLayerOpacityFromSliderValue = (layerId, value) => {
    const opacity = (value - Component.opacitySliderMin) / (Component.opacitySliderMax - Component.opacitySliderMin);

    this.setLayerOpacity(layerId, opacity);
  };

  isBackStepInTimeAllowed = () => {
    return this.state.currentLoadedDate > this.state.timespanPeriod.gte;
  };

  isForwardStepInTimeAllowed = () => {
    return this.state.currentLoadedDate < this.state.timespanPeriod.lte;
  };

  offsetCurrentTimeAtPrecisionByAmount = (amount) => {
    if (!amount) {
      return;
    }

    const datePrecision = getPrecisionByResolution(this.state.timespanResolution);
    let newLoadedDate = offsetDateAtPrecision(this.state.currentLoadedDate, datePrecision, amount);

    if (newLoadedDate.valueOf() > this.state.timespanPeriod.lte.valueOf()) {
      newLoadedDate = this.state.timespanPeriod.lte;
    }

    if (newLoadedDate.valueOf() < this.state.timespanPeriod.gte.valueOf()) {
      newLoadedDate = this.state.timespanPeriod.gte;
    }

    if (newLoadedDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: newLoadedDate,
    });
  };

  timeStepBackButtonOnClick = (/* event */) => {
    this.offsetCurrentTimeAtPrecisionByAmount(-1);
  };

  timeStepForwardButtonOnClick = (/* event */) => {
    this.offsetCurrentTimeAtPrecisionByAmount(1);
  };

  loadedDateOnChange = (event, date) => {
    const datePrecision = getPrecisionByResolution(this.state.timespanResolution);
    let preciseDate = getDateAtPrecision(date, datePrecision);

    if (preciseDate.valueOf() > this.state.timespanPeriod.lte.valueOf()) {
      preciseDate = this.state.timespanPeriod.lte;
    }

    if (preciseDate.valueOf() < this.state.timespanPeriod.gte.valueOf()) {
      preciseDate = this.state.timespanPeriod.gte;
    }

    if (preciseDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: preciseDate,
    });
  };

  /**
   * Build a date string of the date with the precision of the current dataset.
   * @param  {Date} date
   * @return {string}
   */
  buildPreciseDateString = (date) => {
    const datePrecision = getPrecisionByResolution(this.state.timespanResolution);

    return getDateStringAtPrecision(date, datePrecision, [
      'YYYY',
      'YYYY-MM',
      'YYYY-MM-DD',
    ]);
  };

  /**
   * @return {{resolution: string, period: {gte: Date, lte: Date}}}
   */
  getDatasetTimespan = () => {
    const {
      timespan: {
        resolution,
        period,
      },
    } = this.props;

    const datePrecision = getPrecisionByResolution(resolution);

    return {
      resolution,
      period: {
        gte: parseDateStringWithPrecision(period.gte, datePrecision),
        lte: parseDateStringWithPrecision(period.lte, datePrecision),
      },
    };
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

  /**
   * Return the same input string with placeholders filled.
   * @param {string} templateString
   * @returns {string}
   */
  fillOverlayUrl = (templateString) => {
    if (!templateString) {
      return templateString;
    }

    const fillerNames = Object.keys(Component.overlayUrlFillers);

    return fillerNames.reduce((acc, fillerName) => {
      const pattern = `{${fillerName}}`;

      let newAcc = acc;

      while (newAcc.indexOf(pattern) !== -1) {
        const filler = Component.overlayUrlFillers[fillerName];
        const replacement = filler.call(this);

        newAcc = newAcc.replace(pattern, replacement);
      }

      return newAcc;
    }, templateString);
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
      console.warn(`Unknown layer type “${layer.type}” for layer “${layer.id}”`);
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
            zDepth={1}
          >
            <MarkDownRenderer
              value={downloadField.markdown}
            />
          </Paper>
        </div>
      </Tab>
    );
  };

  renderLayerItemAdjustmentOptionControls = (layerItem) => [
    <ListItem
      key="layer-opacity"
      disabled
      primaryText={(
        <div className="adjustment-option__header">
          <label>Opacity: </label>
          <label>{Component.getDisplayTextForLayerOpacity(this.getLayerOpacity(layerItem.id))}</label>
        </div>
      )}
      secondaryText={(
        <div
          style={{
            overflow: 'visible',
            ...Component.paddingForSliders,
          }}
        >
          <Slider
            className="input-slider--layer-opacity"
            min={Component.opacitySliderMin}
            max={Component.opacitySliderMax}
            value={this.getOpacitySliderValueForLayer(layerItem.id)}
            onChange={(event, newValue) => this.setLayerOpacityFromSliderValue(layerItem.id, newValue)}
            sliderStyle={{
              marginTop: 0,
              marginBottom: 0,
            }}
          />
        </div>
      )}
    />,
    <ListItem
      key="layer-style-range"
      disabled
      primaryText={(
        <div className="adjustment-option__header">
          <label>Overlay range: </label>
        </div>
      )}
      secondaryText={(
        <div
          style={{
            overflow: 'visible',
            ...Component.paddingForSliders,
          }}
        >
          <Range
            className="input-slider--layer-opacity"
            min={layerItem.min}
            max={layerItem.max}
            defaultValue={[
              layerItem.min,
              layerItem.max,
            ]}
          />
        </div>
      )}
    />,
    <ListItem
      key="layer-style"
      disabled
      primaryText={(
        <div className="adjustment-option__header">
          <label>Overlay style: </label>
        </div>
      )}
      secondaryText={(
        <div
          style={{
            overflow: 'visible',
          }}
        >
          <SelectField
            value={1}
            style={{
              width: '100%',
            }}
          >{layerItem.styles.map((styleName, index) => (
            <MenuItem
              key={index}
              value={index}
              primaryText={styleName}
            />
          ))}</SelectField>
        </div>
      )}
    />,
  ];

  renderLayerListInLayersTab = (layerListItems = []) => {
    return (
      <List
        className="layer-list"
      >
        <Subheader>Layers</Subheader>
        {layerListItems.map((layerItem) => (
          <ListItem
            key={layerItem.id}
            className="layer-list__item"
            leftCheckbox={(
              <Checkbox
                checked={this.getLayerVisibility(layerItem.id)}
                onCheck={(event, isChecked) => this.setLayerVisibility(layerItem.id, isChecked)}
              />
            )}
            primaryText={layerItem.title}
            nestedItems={this.renderLayerItemAdjustmentOptionControls(layerItem)}
          />
        ))}
      </List>
    );
  };

  renderLayersTab = () => {
    const {
      /**
       * @type {Array<Object>}
       * @property {string} name
       * @property {string} description
       * @property {string} type
       * @property {string} url
       * @property {number} min
       * @property {number} max
       * @property {Array<string>} styles
       */
      overlays: layers,
    } = this.props;

    if (!layers) {
      return null;
    }

    const layerListItems = layers
    // Add `id` property to the layers if not present.
    .map((layer, index) => ({
      id: index,
      ...layer,
    }))
    .map((layer) => ({
      id: layer.id,
      title: layer.name,
      type: layer.type,
      url: layer.url,
      min: layer.min,
      max: layer.max,
      styles: layer.styles,
      invisible: !this.getLayerVisibility(layer.id),
      opacity: this.getLayerOpacity(layer.id),
    }));

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
            {this.renderLayerListInLayersTab(layerListItems)}

            <Toolbar
              style={{
                height: 48,
              }}
            >
              <ToolbarGroup>
                <ToolbarTitle text="Time" />

                <DatePicker
                  openToYearSelection
                  hintText="Controlled Date Input"
                  minDate={this.state.timespanPeriod.gte}
                  maxDate={this.state.timespanPeriod.lte}
                  value={this.state.currentLoadedDate}
                  formatDate={this.buildPreciseDateString}
                  onChange={this.loadedDateOnChange}
                  textFieldStyle={{
                    width: '85px',
                  }}
                />

                <IconButton
                  tooltip="Step back"
                  tooltipPosition={toolbarTooltipPosition}
                  disabled={!this.isBackStepInTimeAllowed()}
                  onClick={this.timeStepBackButtonOnClick}
                >
                  <LeftArrowIcon />
                </IconButton>

                <IconButton
                  tooltip="Step forward"
                  tooltipPosition={toolbarTooltipPosition}
                  disabled={!this.isForwardStepInTimeAllowed()}
                  onClick={this.timeStepForwardButtonOnClick}
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
              {layerListItems.map((layer) => this.renderMapLayer(layer, this.props, this.state)).reverse()}
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

    const boundaryGeoJson = this.getDatasetBoundaryGeoJson();
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.getDatasetExtent();

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
            zDepth={1}
          >
            <Toolbar>
              <ToolbarGroup>
                <RaisedButton
                  label="Point"
                  style={{
                    margin: '0 2px',
                  }}
                />
                <RaisedButton
                  label="Rectangle"
                  style={{
                    margin: '0 2px',
                  }}
                />
                <RaisedButton
                  label="Polygon"
                  style={{
                    margin: '0 2px',
                  }}
                />
              </ToolbarGroup>
            </Toolbar>
            <MapView
              className="map"
              basemap="osm"
              projection="EPSG:4326"
              extent={boundaryExtent}
            >
              {boundaryGeoJsonString && (
                <map-layer-geojson src-json={boundaryGeoJsonString} />
              )}
            </MapView>
          </Paper>
          <Paper
            className="analytics__charts"
            zDepth={0}
            style={{
              backgroundImage: `url(${absoluteUrl('/img/charts-example.png')})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
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
            zDepth={1}
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
            zDepth={1}
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
