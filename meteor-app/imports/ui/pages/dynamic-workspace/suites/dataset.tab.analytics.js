// This is the "Graph View".

import { HTTP } from 'meteor/http';
import _ from 'lodash';
import objectPath from 'object-path';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import JsZip from 'jszip';
import * as FileSaver from 'file-saver';
import Paper from 'material-ui/Paper';
import {
  Card,
  CardActions,
  CardMedia,
  CardText,
} from 'material-ui/Card';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import {
  List,
  ListItem,
} from 'material-ui/List';
import c3 from 'c3';
import 'c3/c3.css';

import {
  DatasetChartIcon,
  mapToolbarStyles,
  PanToolIcon,
  PointToolIcon,
  BoxToolIcon,
} from '/imports/ui/consts';

import {
  buildGeoJsonWithGeometry,
  PatheticDataRequester,
  getPrecisionByResolution,
  offsetDateAtPrecision,
  makeSVGDocAsync,
  svgDocToBlob,
  fillTemplateString,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabBaseClass from './dataset.tab.BaseClass';

// Temporary helper function. Put this somewhere else.
const getGeometryOfPoint = (point) => {
  return {
    type: 'Point',
    coordinates: [
      point.x,
      point.y,
    ],
  };
};

class AnalyticsChart extends React.PureComponent {
  static propTypes = {
    temporalResolution: PropTypes.string.isRequired,
    temporalPeriod: PropTypes.shape({
      gte: PropTypes.instanceOf(Date),
      lte: PropTypes.instanceOf(Date),
    }).isRequired,
    data: PropTypes.shape({
      datasetId: PropTypes.string,
      variableName: PropTypes.string,
      range: PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
      }),
      values: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,
  };

  static timeFormatsForC3 = [
    '%Y',
    '%Y-%m',
    '%Y-%m-%d',
    '%Y-%m-%d %H',
    '%Y-%m-%d %H:%M',
    '%Y-%m-%d %H:%M:%S',
  ];

  componentDidMount () {
    this.renderChart();
  }

  componentWillReceiveProps (nextProps) {
    if (
      nextProps.temporalResolution !== this.props.temporalResolution ||
      !_.isEqual(nextProps.temporalPeriod, this.props.temporalPeriod) ||
      !_.isEqual(nextProps.data, this.props.data)
    ) {
      this.renderChart();
    }
  }

  shouldComponentUpdate () {
    return false;
  }

  toBlob = async () => {
    const svgElement = this._chartContainer.querySelector('svg');

    if (!svgElement) {
      return null;
    }

    const svgDoc = await makeSVGDocAsync(svgElement);

    return svgDocToBlob(svgDoc);
  };

  renderChart () {
    const {
      temporalResolution,
      temporalPeriod,
      data,
    } = this.props;

    const temporalPrecision = getPrecisionByResolution(temporalResolution);
    const startDate = new Date(temporalPeriod.gte);
    const xAxisFormat = AnalyticsChart.timeFormatsForC3[temporalPrecision];
    const xAxisLabelBaseIndex = objectPath.get(data, 'range.start', 0);
    const xAxisLabels = data.values.map((v, index) => {
      const date = offsetDateAtPrecision(startDate, temporalPrecision, xAxisLabelBaseIndex + index);

      return date;
    });

    this._chart = c3.generate({
      bindto: this._chartContainer,
      data: {
        x: 'x',
        // xFormat: '%Y-%m', // 'xFormat' can be used as custom format of 'x'
        // xFormat: xAxisFormat,
        columns: [
          ['x', ...xAxisLabels],
          [data.variableName, ...data.values],
        ],
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: xAxisFormat,
          },
        },
      },
      point: {
        show: false,
      },
    });
  }

  render () {
    return (
      <div
        ref={(ref) => this._chartContainer = ref}
      />
    );
  }
}

class AnalyticsTabContent extends React.Component {

  static propTypes = {
    analytics: PropTypes.any.isRequired,
    selectedVariableId: PropTypes.string.isRequired,
    dateRange: PropTypes.any.isRequired,
    dateResolution: PropTypes.any.isRequired,
    boundaryExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
    boundaryGeoJsonString: PropTypes.string.isRequired,

    isPanelOpen: PropTypes.func.isRequired,
    togglePanelOpenState: PropTypes.func.isRequired,
    getFrameIndexInTimespan: PropTypes.func.isRequired,
    renderVariableList: PropTypes.func.isRequired,
    renderTemporalControls: PropTypes.func.isRequired,
  };

  static selectionTools = [
    {
      name: 'pan',
      IconClass: PanToolIcon,
      title: 'Pan tool',
    },
    {
      name: 'point',
      IconClass: PointToolIcon,
      title: 'Point tool',
      drawingType: 'Point',
    },
    {
      name: 'rectangle',
      IconClass: BoxToolIcon,
      title: 'Rectangle tool',
      drawingType: 'Box',
    },
  ];

  constructor (props) {
    super(props);

    this._chartComponent = null;
    this._analyticsBoundaryDrawingLayer = null;
    this._analyticsBoundaryDrawingInteraction = null;

    const defaultSelectionTool = AnalyticsTabContent.selectionTools[0];

    this.state = {
      // Geometry of the analytics area.
      analyticsBoundaryGeometry: null,
      // @type {string}
      activeSelectionToolName: defaultSelectionTool.name,
      // @type {string|null}
      activeDrawingType: defaultSelectionTool.drawingType,
      // @type {boolean}
      isLoadingTimeSeriesData: false,
      // @type {boolean}
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      // @type {Date}
      timeSeriesDataRequestDate: null,
      // @type {Date}
      timeSeriesDataResponseDate: null,
    };
  }

  componentDidMount () {
    this.connectOverviewMap();
  }

  componentWillUpdate () {
    this.disconnectOverviewMap();
  }

  componentDidUpdate () {
    this.connectOverviewMap();
  }

  componentWillUnmount () {
    this.disconnectOverviewMap();
  }

  onDataReady = (data) => {
    console.log('onDataReady', data);

    this.setState({
      isLoadingTimeSeriesData: false,
      isTimeSeriesDataLoaded: true,
      timeSeriesData: data,
      timeSeriesDataResponseDate: new Date(),
    });
  };

  onDataError = (reason) => {
    console.error('request error', reason);

    this.setState({
      isLoadingTimeSeriesData: false,
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      timeSeriesDataResponseDate: new Date(),
    });
  };

  onDownload = async () => {
    const zip = new JsZip();

    const {
      analyticsBoundaryGeometry,
      timeSeriesData,
    } = this.state;
    const analyticsBoundaryGeoJsonString = analyticsBoundaryGeometry && JSON.stringify(buildGeoJsonWithGeometry(analyticsBoundaryGeometry));

    if (analyticsBoundaryGeoJsonString) {
      zip.file('boundary.geojson', analyticsBoundaryGeoJsonString);
    }

    const csvString = objectPath.get(timeSeriesData, 'csv');

    if (csvString) {
      zip.file('time-series.csv', csvString);
    }

    const chart = this._chartComponent;

    if (chart) {
      zip.file('chart.svg', await chart.toBlob());
    }

    const blob = await zip.generateAsync({ type: 'blob' });

    FileSaver.saveAs(blob, 'download.zip');
  };

  getAnalyticsByName = (name) => {
    return this.props.analytics.find((analytic) => {
      return analytic.name === name;
    });
  };

  setSelectionToolActive (tool) {
    this.setState({
      analyticsBoundaryGeometry: null,
      activeSelectionToolName: tool.name,
      activeDrawingType: tool.drawingType,
    });

    // If the new tool can't draw, don't clear existing features.
    if (tool.drawingType) {
      this.clearAnalyticsBoundaryFeature();
    }
  }

  isSelectionToolActive (tool) {
    return this.state.activeSelectionToolName === tool.name;
  }

  clearAnalyticsBoundaryFeature = () => {
    this._analyticsBoundaryDrawingLayer.clearFeatures();
  };

  updateAnalyticsBoundaryOnAddNewExtentFeature = (olEvent) => {
    const olGeometry = olEvent.feature.getGeometry();
    const jsonGeometry = this._analyticsBoundaryDrawingLayer.writeGeometryObject(olGeometry);

    this.setState({
      analyticsBoundaryGeometry: jsonGeometry,
    });
  };

  connectOverviewMap () {
    // Restrict to have at most 1 feature in the layer.
    if (this._analyticsBoundaryDrawingInteraction) {
      this._analyticsBoundaryDrawingInteraction.addEventListener('drawstart', this.clearAnalyticsBoundaryFeature);
    }
    // When a new box is drawn, update the viewing extent.
    if (this._analyticsBoundaryDrawingLayer) {
      this._analyticsBoundaryDrawingLayer.addEventListener('addfeature', this.updateAnalyticsBoundaryOnAddNewExtentFeature);
    }
  }

  disconnectOverviewMap () {
    if (this._analyticsBoundaryDrawingInteraction) {
      this._analyticsBoundaryDrawingInteraction.removeEventListener('drawstart', this.clearAnalyticsBoundaryFeature);
    }
    if (this._analyticsBoundaryDrawingLayer) {
      this._analyticsBoundaryDrawingLayer.removeEventListener('addfeature', this.updateAnalyticsBoundaryOnAddNewExtentFeature);
    }
  }

  /**
   * @memberof AnalyticsTab
   * @param {Object} payload - Contains everything passed to but not used by the `PatheticDataRequester`.
   * @param {Function} resolve - Resolve the request with data.
   * @param {Function} reject - Reject the request with a reason.
   */
  requestData = (payload, resolve, reject) => {
    console.log('requestData', payload);

    // Clear existing data.
    this.setState({
      isLoadingTimeSeriesData: false,
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      timeSeriesDataRequestDate: null,
      timeSeriesDataResponseDate: null,
    });

    if (!(payload.variableName && payload.boundaryGeometry && payload.dateRange)) {
      return;
    }

    const analytics = this.getAnalyticsByName(payload.variableName);
    const requestBody = {};
    const remoteUrl = fillTemplateString(
      analytics.url,
      {
        LAT: () => {
          if (payload.boundaryGeometry.type === 'Point') {
            return payload.boundaryGeometry.coordinates[1];
          }

          return null;
        },
        LONG: () => {
          if (payload.boundaryGeometry.type === 'Point') {
            return payload.boundaryGeometry.coordinates[0];
          }

          return null;
        },
        boundaryGeometry: payload.boundaryGeometry,
        start: () => this.props.getFrameIndexInTimespan(payload.dateRange[0]),
        end: () => this.props.getFrameIndexInTimespan(payload.dateRange[1]),
      },
      requestBody,
    );

    console.log('requestData', 'requesting', remoteUrl, requestBody);

    this.setState({
      isLoadingTimeSeriesData: true,
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      timeSeriesDataRequestDate: new Date(),
      timeSeriesDataResponseDate: null,
    });

    HTTP.post(
      remoteUrl,
      {
        json: true,
        data: {
          // Workaround until the url templates are ready.
          start: this.props.getFrameIndexInTimespan(payload.dateRange[0]),
          end: this.props.getFrameIndexInTimespan(payload.dateRange[1]),
          ...requestBody,
        },
      },
      (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (response.statusCode !== 200) {
          reject(response);
          return;
        }

        // @see AnalyticsChart.propTypes.data
        resolve(response.data);
      },
    );
  };

  render () {
    const {
      selectedVariableId,
      dateRange,
      dateResolution,
      boundaryExtent,
      boundaryGeoJsonString,

      isPanelOpen,
      togglePanelOpenState,
      renderVariableList,
      renderTemporalControls,
    } = this.props;
    const {
      analyticsBoundaryGeometry,
      activeDrawingType,
      isLoadingTimeSeriesData,
      isTimeSeriesDataLoaded,
      timeSeriesData,
      timeSeriesDataRequestDate,
      timeSeriesDataResponseDate,
    } = this.state;

    const analyticsBoundaryGeoJsonString = analyticsBoundaryGeometry && JSON.stringify(buildGeoJsonWithGeometry(analyticsBoundaryGeometry));

    return (
      <div className="dataset__analytics-tab">
        <PatheticDataRequester
          variableName={selectedVariableId}
          boundaryGeometry={analyticsBoundaryGeometry}
          dateRange={dateRange}
          requester={this.requestData}
          onReady={this.onDataReady}
          onError={this.onDataError}
          verbose
        />

        <Paper
          className="analytics__controls"
          zDepth={1}
        >
          <List>
            {renderVariableList({})}
            {renderTemporalControls({})}

            <ListItem
              key="analytics-boundary"
              primaryText="Select analytics boundary"
              primaryTogglesNestedList
              open={isPanelOpen('analytics-boundary')}
              onNestedListToggle={() => togglePanelOpenState('analytics-boundary')}
              nestedItems={[
                <ListItem
                  disabled
                  key="map"
                >
                  <Toolbar
                    style={{
                      ...mapToolbarStyles.root,
                    }}
                  >
                    <ToolbarGroup>
                      <ToolbarTitle
                        text="Tools"
                        style={{
                          ...mapToolbarStyles.title,
                        }}
                      />
                    </ToolbarGroup>
                    <ToolbarGroup>
                      {AnalyticsTabContent.selectionTools.map((item) => (
                        <RaisedButton
                          key={item.name}
                          className="selection-tool-button"
                          icon={<item.IconClass style={mapToolbarStyles.toggleButton.icon} />}
                          style={{
                            ...mapToolbarStyles.toggleButton.root,
                            ...(this.isSelectionToolActive(item) && mapToolbarStyles.toggleButton.active),
                          }}
                          buttonStyle={mapToolbarStyles.toggleButton.button}
                          overlayStyle={{
                            ...mapToolbarStyles.toggleButton.overlay,
                          }}
                          onClick={() => this.setSelectionToolActive(item)}
                        />
                      ))}
                    </ToolbarGroup>
                  </Toolbar>
                  <MapView
                    className="map"
                    basemap="arcgis"
                    projection="EPSG:4326"
                    extent={boundaryExtent}
                    // onClick={(event) => this.onClickMap(event)}
                    style={{
                      '--aspect-ratio': '4/3',
                    }}
                  >
                    {this.hasSelectedVariable && this.renderMapLayerForSelectedVariable()}
                    {boundaryGeoJsonString && (
                      <map-layer-geojson src-json={boundaryGeoJsonString} />
                    )}
                    {analyticsBoundaryGeoJsonString && (
                      <map-layer-geojson src-json={analyticsBoundaryGeoJsonString} />
                    )}
                    <map-layer-vector
                      id="analytics-boundary-drawing-layer"
                      ref={(ref) => this._analyticsBoundaryDrawingLayer = ref}
                    />
                    <map-interaction-defaults />
                    <map-interaction-draw
                      disabled={activeDrawingType ? null : 'disabled'}
                      source="analytics-boundary-drawing-layer"
                      type={activeDrawingType}
                      ref={(ref) => this._analyticsBoundaryDrawingInteraction = ref}
                    />
                    <map-control-defaults />
                  </MapView>
                </ListItem>,
              ]}
            />
          </List>
        </Paper>

        <Paper
          className="analytics__charts"
          zDepth={1}
          style={{
            padding: '10px 30px',
          }}
        >
          {!isLoadingTimeSeriesData && isTimeSeriesDataLoaded && timeSeriesData && (
            <Card
              zDepth={0}
            >
              <CardMedia>
                <AnalyticsChart
                  temporalResolution={dateResolution}
                  temporalPeriod={{
                    gte: dateRange[0],
                    lte: dateRange[1],
                  }}
                  data={timeSeriesData}
                  ref={(ref) => this._chartComponent = ref}
                />
              </CardMedia>
              <CardText>
                <div>Loaded in {moment.duration({
                  from: timeSeriesDataRequestDate,
                  to: timeSeriesDataResponseDate,
                }).asSeconds()} s.</div>
              </CardText>
              <CardActions>
                <RaisedButton
                  className="download-chart-button"
                  label="Download Chart"
                  disabled={!(!isLoadingTimeSeriesData && isTimeSeriesDataLoaded && timeSeriesData)}
                  onClick={this.onDownload}
                />
              </CardActions>
            </Card>
          )}
          {isLoadingTimeSeriesData && !isTimeSeriesDataLoaded && (
            <LinearProgress mode="indeterminate" />
          )}
          {!isLoadingTimeSeriesData && !isTimeSeriesDataLoaded && (
            <Paper
              style={{
                padding: '20px 30px',
                margin: '20px 0',
                textAlign: 'center',
              }}
              zDepth={2}
            >
              <p>Select <b>a variable</b> and <b>a valid point in the boundary</b> to view the time series data.</p>
            </Paper>
          )}
        </Paper>
      </div>
    );
  }
}

export default
class AnalyticsTab extends TabBaseClass {

  static tabIcon = DatasetChartIcon;
  static tabLabel = 'Graph View';
  static requiredProps = [
    'analyticService',
    'analytics',
  ];

  onClickMap = (event) => {
    if (!this.isSelectionToolActive('point')) {
      return;
    }

    const point = {
      x: event.latLongCoordinate[0],
      y: event.latLongCoordinate[1],
    };

    console.log('point', point);

    this.setState({
      analyticsBoundaryGeometry: getGeometryOfPoint(point),
    });
  };

  renderBody () {
    const boundaryGeoJson = this.component.boundaryGeoJson;

    return (
      <AnalyticsTabContent
        analytics={this.props.analytics}
        selectedVariableId={this.selectedVariableId}
        dateRange={this.dateRange}
        dateResolution={this.component.timespan.resolution}
        boundaryExtent={this.component.extent}
        boundaryGeoJsonString={boundaryGeoJson && JSON.stringify(boundaryGeoJson)}

        isPanelOpen={this.isPanelOpen}
        togglePanelOpenState={this.togglePanelOpenState}
        getFrameIndexInTimespan={this.getFrameIndexInTimespan}
        renderVariableList={this.renderVariableList}
        renderTemporalControls={this.renderTemporalControls}
      />
    );
  }
}
