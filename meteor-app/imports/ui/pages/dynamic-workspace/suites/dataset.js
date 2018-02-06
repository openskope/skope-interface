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
import DatePicker from 'material-ui/DatePicker';
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
    // yearStart: PropTypes.number.isRequired,
    // yearEnd: PropTypes.number.isRequired,
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

    const layerListItems = layers
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
            <Subheader>Layers</Subheader>
            <LayerList
              layers={layerListItems}
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

                <DatePicker
                  hintText="Controlled Date Input"
                  minDate={this.state.timespanPeriod.gte}
                  maxDate={this.state.timespanPeriod.lte}
                  value={this.state.currentLoadedDate}
                  onChange={this.loadedDateOnChange}
                  openToYearSelection
                  formatDate={this.buildPreciseDateString}
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
