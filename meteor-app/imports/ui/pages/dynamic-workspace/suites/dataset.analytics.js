import {
  Meteor,
} from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import _ from 'lodash';
import objectPath from 'object-path';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import PointIcon from 'material-ui/svg-icons/action/room';
import RectangleIcon from 'material-ui/svg-icons/image/crop-landscape';
import LinearProgress from 'material-ui/LinearProgress';
import {
  List,
  ListItem,
} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import {
  RadioButton,
} from 'material-ui/RadioButton';
import c3 from 'c3';
import 'c3/c3.css';

import {
  DatasetChartIcon,
} from '/imports/ui/consts';

import {
  buildGeoJsonWithGeometry,
  PatheticDataRequester,
  getPrecisionByResolution,
  offsetDateAtPrecision,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import SubComponentClass from './SubComponentClass';

import * as mapLayerRenderers from './dataset.mapLayerRenderers';

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

  shouldComponentUpdate (nextProps) {
    if (nextProps.temporalResolution !== this.props.temporalResolution) {
      return true;
    }

    if (!_.isEqual(nextProps.temporalPeriod, this.props.temporalPeriod)) {
      return true;
    }

    if (!_.isEqual(nextProps.data, this.props.data)) {
      return true;
    }

    return false;
  }

  componentDidUpdate () {
    this.renderChart();
  }

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
      subchart: {
        show: true,
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

export default
class AnalyticsTab extends SubComponentClass {
  static selectionTools = [
    {
      name: 'point',
      IconClass: PointIcon,
    },
    {
      name: 'rectangle',
      IconClass: RectangleIcon,
    },
  ];

  getInitialState () {
    return {
      // ID of the selected variable for analytics.
      activeVariableName: null,
      // Geometry of the analytics area.
      analyticsBoundaryGeometry: null,
      // @type {string}
      activeSelectionToolName: AnalyticsTab.selectionTools[0].name,
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

  onChangeActiveAnalytics = (event, value) => {
    this.setState({
      activeVariableName: value,
    });
  };

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

  getAnalyticsByName = (name) => {
    return this.props.analytics.find((analytic) => {
      return analytic.name === name;
    });
  };

  /**
   * @memberof AnalyticsTab
   * @param {Object} payload - Contains everything passed to but not used by the `PatheticDataRequester`.
   * @param {Function} resolve - Resolve the request with data.
   * @param {Function} reject - Reject the request with a reason.
   */
  requestData = (payload, resolve, reject) => {
    console.log('requestData', payload);

    if (!(payload.variableName && payload.boundaryGeometry)) {
      return;
    }

    const analytics = this.getAnalyticsByName(payload.variableName);
    //! Fill this url with state values if needed.
    const remoteUrl = analytics.url;

    console.log('requestData', 'requesting', analytics.url);

    this.setState({
      isLoadingTimeSeriesData: true,
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      timeSeriesDataRequestDate: new Date(),
      timeSeriesDataResponseDate: null,
    });

    HTTP.get(
      remoteUrl,
      {
        json: true,
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

  isSelectionToolActive (toolName) {
    return this.state.activeSelectionToolName === toolName;
  }

  setSelectionToolActive (toolName) {
    this.setState({
      analyticsBoundaryGeometry: null,
      activeSelectionToolName: toolName,
    });
  }

  /**
   * @param {string} variableName
   */
  renderMapLayerForVariable (variableName) {
    const layer = objectPath.get(this.component.variables, [variableName, 'overlay']);

    if (!layer) {
      return null;
    }

    if (!(layer.type in mapLayerRenderers)) {
      console.warn(`Unknown layer type “${layer.type}” for layer “${layer.name}”`);
      return null;
    }

    const mapLayerRenderer = mapLayerRenderers[layer.type];

    return mapLayerRenderer.call(this, {
      ...layer,
      extent: this.component.extent,
      visible: true,
      opacity: 0.7,
    }, {
      YYYY: () => moment(this.component.timespan.period.lte).format('YYYY'),
      MM: () => moment(this.component.timespan.period.lte).format('MM'),
      DD: () => moment(this.component.timespan.period.lte).format('DD'),
    });
  }

  render () {
    const {
      analyticService: analyticsField,
      analytics,
      muiTheme,
    } = this.props;
    const {
      activeVariableName,
      analyticsBoundaryGeometry,
      isLoadingTimeSeriesData,
      isTimeSeriesDataLoaded,
      timeSeriesData,
      timeSeriesDataRequestDate,
      timeSeriesDataResponseDate,
    } = this.state;

    if (!(analyticsField && analytics)) {
      return null;
    }

    const boundaryGeoJson = this.component.boundaryGeoJson;
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.component.extent;
    const analyticsBoundaryGeoJsonString = analyticsBoundaryGeometry && JSON.stringify(buildGeoJsonWithGeometry(analyticsBoundaryGeometry));

    const {
      resolution,
      period,
    } = this.component.timespan;

    const mapToolbarStyles = {
      root: {
        padding: '0px 0.75em',
      },
      title: {
        fontSize: '1em',
      },
      toggleButton: {
        root: {
          margin: '0 1px 0 0',
          minWidth: false,
          width: '2.5em',
          color: muiTheme.palette.disabledColor,
          transition: false,
        },
        active: {
          backgroundColor: muiTheme.palette.toggleButtonActiveBackgroundColor,
          color: muiTheme.palette.textColor,
        },
        icon: {
          height: '1.25em',
          width: '1.25em',
          color: 'inherit',
          fill: 'currentColor',
          transition: false,
        },
        button: {
          height: '1.875em',
          lineHeight: '1.875em',
          backgroundColor: 'inherit',
          color: 'inherit',
          transition: false,
        },
        overlay: {
          height: '100%',
        },
      },
    };

    return (
      <Tab
        label={this.component.renderTabLabel({
          IconComponent: DatasetChartIcon,
          label: 'Analytics',
        })}
        value="analytics"
      >
        <PatheticDataRequester
          variableName={activeVariableName}
          boundaryGeometry={analyticsBoundaryGeometry}
          requester={this.requestData}
          onReady={this.onDataReady}
          onError={this.onDataError}
          verbose
        />
        <div className="dataset__analytics-tab">
          <Paper
            className="analytics__controls"
            zDepth={1}
          >
            <List
              className="layer-list"
            >
              <Subheader>Variables with analytics</Subheader>
              {analytics.map(({ name }) => (
                <ListItem
                  key={name}
                  className="layer-list__item"
                  leftCheckbox={(
                    <RadioButton
                      value={name}
                      checked={activeVariableName === name}
                      onCheck={(event, value) => this.onChangeActiveAnalytics(event, value)}
                    />
                  )}
                  primaryText={name}
                />
              ))}
            </List>

            <div className="map-and-toolbar">
              <Toolbar
                style={{
                  ...mapToolbarStyles.root,
                }}
              >
                <ToolbarGroup>
                  <ToolbarTitle
                    text="Select boundary"
                    style={{
                      ...mapToolbarStyles.title,
                    }}
                  />
                </ToolbarGroup>
                <ToolbarGroup>
                  {AnalyticsTab.selectionTools.map((item) => (
                    <RaisedButton
                      key={item.name}
                      className="selection-tool-button"
                      icon={<item.IconClass style={mapToolbarStyles.toggleButton.icon} />}
                      style={{
                        ...mapToolbarStyles.toggleButton.root,
                        ...(this.isSelectionToolActive(item.name) && mapToolbarStyles.toggleButton.active),
                      }}
                      buttonStyle={mapToolbarStyles.toggleButton.button}
                      overlayStyle={{
                        ...mapToolbarStyles.toggleButton.overlay,
                      }}
                      onClick={() => this.setSelectionToolActive(item.name)}
                    />
                  ))}
                </ToolbarGroup>
              </Toolbar>
              <MapView
                className="map"
                basemap="osm"
                projection="EPSG:4326"
                extent={boundaryExtent}
                onClick={(event) => this.onClickMap(event)}
              >
                {activeVariableName && this.renderMapLayerForVariable(activeVariableName)}
                {boundaryGeoJsonString && (
                  <map-layer-geojson src-json={boundaryGeoJsonString} />
                )}
                {analyticsBoundaryGeoJsonString && (
                  <map-layer-geojson src-json={analyticsBoundaryGeoJsonString} />
                )}
                <map-interaction-defaults />
                <map-control-defaults />
              </MapView>
            </div>
          </Paper>

          <Paper
            className="analytics__charts"
            zDepth={0}
            style={{
              padding: '10px 30px',
            }}
          >
            {!isLoadingTimeSeriesData && isTimeSeriesDataLoaded && timeSeriesData && (
              <Paper
                style={{
                  padding: '20px 30px',
                  margin: '20px 0',
                }}
                zDepth={2}
              >
                <AnalyticsChart
                  temporalResolution={resolution}
                  temporalPeriod={period}
                  data={timeSeriesData}
                />
              </Paper>
            )}
            {!isLoadingTimeSeriesData && isTimeSeriesDataLoaded && (
              <div>Loaded in {moment.duration({
                from: timeSeriesDataRequestDate,
                to: timeSeriesDataResponseDate,
              }).asSeconds()} s.</div>
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
                <h4>Select a variable and a boundary to view the time serires data.</h4>
              </Paper>
            )}
          </Paper>
        </div>
      </Tab>
    );
  }
}
