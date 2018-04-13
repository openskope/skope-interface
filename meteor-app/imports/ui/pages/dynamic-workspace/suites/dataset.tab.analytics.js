// This is the "Graph View".

import { HTTP } from 'meteor/http';
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
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import {
  List,
} from 'material-ui/List';

import {
  DatasetChartIcon,
  PanToolIcon,
  PointToolIcon,
  BoxToolIcon,
} from '/imports/ui/consts';

import {
  buildGeoJsonWithGeometry,
  PatheticDataRequester,
  fillTemplateString,
} from '/imports/ui/helpers';

import TabBaseClass from './dataset.tab.BaseClass';
import AnalyticsChart from './dataset.AnalyticsChart';

class AnalyticsTabContent extends React.Component {

  static propTypes = {
    analytics: PropTypes.any.isRequired,
    selectedVariableId: PropTypes.string.isRequired,
    dateRange: PropTypes.any.isRequired,
    dateResolution: PropTypes.any.isRequired,
    focusGeometry: PropTypes.object,

    getFrameIndexInTimespan: PropTypes.func.isRequired,
    renderVariableList: PropTypes.func.isRequired,
    renderTemporalControls: PropTypes.func.isRequired,
    renderFocusBoundaryMap: PropTypes.func.isRequired,
  };

  static defaultProps = {
    focusGeometry: null,
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

    this.state = {
      // @type {boolean}
      isLoadingTimeSeriesData: false,
      // @type {boolean}
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      // @type {Date}
      timeSeriesDataRequestDate: null,
      // @type {string|null}
      timeSeriesDataRequestError: null,
      // @type {Date}
      timeSeriesDataResponseDate: null,
    };
  }

  onDataReady = (data) => {
    console.log('onDataReady', data);

    this.setState({
      isLoadingTimeSeriesData: false,
      isTimeSeriesDataLoaded: true,
      timeSeriesData: data,
      timeSeriesDataRequestError: null,
      timeSeriesDataResponseDate: new Date(),
    });
  };

  onDataError = (reason) => {
    console.error('request error', reason);

    this.setState({
      isLoadingTimeSeriesData: false,
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      timeSeriesDataRequestError: reason.message,
      timeSeriesDataResponseDate: new Date(),
    });
  };

  onDownload = async () => {
    const zip = new JsZip();

    const {
      focusGeometry,
    } = this.props;
    const {
      timeSeriesData,
    } = this.state;

    const focusBoundaryGeoJson = buildGeoJsonWithGeometry(focusGeometry);
    const focusBoundaryGeoJsonString = focusBoundaryGeoJson && JSON.stringify(focusBoundaryGeoJson);

    if (focusBoundaryGeoJsonString) {
      zip.file('boundary.geojson', focusBoundaryGeoJsonString);
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
      timeSeriesDataRequestError: null,
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
      timeSeriesDataRequestError: null,
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
      focusGeometry,
    } = this.props;
    const {
      isLoadingTimeSeriesData,
      isTimeSeriesDataLoaded,
      timeSeriesData,
      timeSeriesDataRequestDate,
      timeSeriesDataRequestError,
      timeSeriesDataResponseDate,
    } = this.state;

    return (
      <div className="dataset__analytics-tab">
        <PatheticDataRequester
          variableName={selectedVariableId}
          boundaryGeometry={focusGeometry}
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
            {this.props.renderVariableList({})}
            {this.props.renderTemporalControls({})}
            {this.props.renderFocusBoundaryMap({
              selectionTools: AnalyticsTabContent.selectionTools,
            })}
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
          {!isLoadingTimeSeriesData && !isTimeSeriesDataLoaded && !timeSeriesDataRequestError && (
            <div>
              <p>Select <b>a variable</b> and <b>a valid point in the boundary</b> to view the time series data.</p>
            </div>
          )}
          {!isLoadingTimeSeriesData && !isTimeSeriesDataLoaded && timeSeriesDataRequestError && (
            <div>
              <p>Error when requesting the data: </p>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{timeSeriesDataRequestError}</pre>
            </div>
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

  renderBody () {
    return (
      <AnalyticsTabContent
        analytics={this.props.analytics}
        selectedVariableId={this.selectedVariableId}
        dateRange={this.dateRange}
        dateResolution={this.component.timespan.resolution}
        focusGeometry={this.focusGeometry}

        getFrameIndexInTimespan={this.component.getFrameIndexInTimespan}
        renderVariableList={this.renderVariableList}
        renderTemporalControls={this.renderTemporalControls}
        renderFocusBoundaryMap={this.renderFocusBoundaryMap}
      />
    );
  }
}