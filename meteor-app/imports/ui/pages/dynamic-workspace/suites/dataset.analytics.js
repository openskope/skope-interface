import {
  Meteor,
} from 'meteor/meteor';
import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import PointIcon from 'material-ui/svg-icons/action/room';
import RectangleIcon from 'material-ui/svg-icons/image/crop-landscape';
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

const fakeData = [130, 340, 200, 500, 250, 350];

class AnalyticsChart extends React.PureComponent {
  static propTypes = {
    temporalResolution: PropTypes.string.isRequired,
    temporalPeriod: PropTypes.shape({
      gte: PropTypes.instanceOf(Date),
      lte: PropTypes.instanceOf(Date),
    }).isRequired,
    dataPoints: PropTypes.arrayOf(PropTypes.number).isRequired,
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

    if (!_.isEqual(nextProps.dataPoints, this.props.dataPoints)) {
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
      dataPoints,
    } = this.props;

    const temporalPrecision = getPrecisionByResolution(temporalResolution);
    const startDate = new Date(temporalPeriod.gte);
    const xAxisFormat = AnalyticsChart.timeFormatsForC3[temporalPrecision];
    const xAxisLabels = dataPoints.map((v, index) => {
      const date = offsetDateAtPrecision(startDate, temporalPrecision, index);

      return date;
    });

    console.log('renderChart', {
      temporalResolution,
      startDate,
      xAxisFormat,
      xAxisLabels,
    });

    this._chart = c3.generate({
      bindto: this._chartContainer,
      data: {
        x: 'x',
        // xFormat: '%Y-%m', // 'xFormat' can be used as custom format of 'x'
        // xFormat: xAxisFormat,
        columns: [
          ['x', ...xAxisLabels],
          ['data', ...dataPoints],
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
      // ID of the selected analytics.
      activeAnalyticsId: null,
      // Geometry of the analytics area.
      analyticsBoundaryGeometry: null,
      // @type {string}
      activeSelectionToolName: null,
    };
  }

  onChangeActiveAnalytics = (event, index, value) => {
    this.setState({
      activeAnalyticsId: value,
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

  requestData = (payload, resolve, reject) => {
    console.log('requestData', payload);

    if (!(payload.variableName && payload.boundaryGeometry)) {
      return;
    }

    console.log('requestData', 'requesting');

    Meteor.call('timeseries.get', payload, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  };

  onDataReady = (data) => {
    console.log('onDataReady', data);
  };

  onDataError = (reason) => {
    console.error('request error', reason);
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

  render () {
    const {
      analyticService: analyticsField,
      analytics,
      muiTheme,
    } = this.props;
    const {
      activeAnalyticsId,
      analyticsBoundaryGeometry,
    } = this.state;

    if (!(analyticsField && analytics)) {
      return null;
    }

    const boundaryGeoJson = this.component.getDatasetBoundaryGeoJson();
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.component.getDatasetExtent();
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
          variableName={activeAnalyticsId}
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
            <SelectField
              floatingLabelText="Select variable"
              floatingLabelFixed={false}
              value={activeAnalyticsId}
              onChange={(event, index, value) => this.onChangeActiveAnalytics(event, index, value)}
              style={{
                width: '100%',
              }}
              floatingLabelStyle={{
                color: muiTheme.palette.primary1Color,
              }}
            >
              <MenuItem
                value={null}
                primaryText=""
                style={{
                  display: 'none',
                }}
              />
              {analytics.map(({ name }, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={name}
                    primaryText={name}
                  />
                );
              })}
            </SelectField>

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
                {boundaryGeoJsonString && (
                  <map-layer-geojson src-json={boundaryGeoJsonString} />
                )}
                {analyticsBoundaryGeoJsonString && (
                  <map-layer-geojson src-json={analyticsBoundaryGeoJsonString} />
                )}
              </MapView>
            </div>
          </Paper>
          <Paper
            className="analytics__charts"
            zDepth={0}
            style={{
              padding: '10px 20px',
            }}
          >
            <AnalyticsChart
              temporalResolution={resolution}
              temporalPeriod={period}
              dataPoints={fakeData}
            />
          </Paper>
        </div>
      </Tab>
    );
  }
}
