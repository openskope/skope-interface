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
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {
  List,
} from 'material-ui/List';

import Raven from '/imports/startup/client/sentry';
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

import TabBaseClass from '../BaseClass';
import AnalyticsChart from '../../AnalyticsChart';

class AnalyticsTabContent extends React.Component {

  static propTypes = {
    analytics: PropTypes.any.isRequired,
    selectedVariableId: PropTypes.string.isRequired,
    dateRange: PropTypes.any.isRequired,
    dateResolution: PropTypes.any.isRequired,
    focusGeometry: PropTypes.object,

    getVariableNameById: PropTypes.func.isRequired,
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
      freehandDrawing: true,
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
      // @type {boolean}
      isPendingTimeSeriesChartRender: false,
      // @type {boolean}
      isRenderingTimeSeriesChart: false,
      // @type {Date}
      timeSeriesChartRenderStartDate: null,
      // @type {Date}
      timeSeriesChartRenderEndDate: null,
    };
  }

  onDataReady = (data) => {
    console.log('AnalyticsTabContent.onDataReady', data);

    this.setState({
      isLoadingTimeSeriesData: false,
      isTimeSeriesDataLoaded: true,
      timeSeriesData: data,
      timeSeriesDataRequestError: null,
      timeSeriesDataResponseDate: new Date(),
      isPendingTimeSeriesChartRender: true,
    });
  };

  onDataError = (error) => {
    console.error('AnalyticsTabContent.onDataError', error);

    const rawErrorMessage = error.message;
    // Prepare a more friendly error message. If this always returns a valid value then the raw error will never be displayed.
    const {
      level: reportLevel,
      message: niceErrorMessage,
    } = (() => {
      switch (true) {
        case objectPath.get(error, 'originalError.message') === 'network':
          return {
            level: 'error',
            message: 'Can not connect to the data service for the selected variable due to a network error.',
          };
        case objectPath.get(error, 'originalError.response.data.message').indexOf('exceeded time limit of') > -1:
          return {
            level: 'warn',
            message: 'The server took too long to respond. Please try again or select a smaller area.',
          };
        case objectPath.get(error, 'originalError.response.data.message') === 'Coordinates are outside region covered by the dataset':
          return {
            level: 'info',
            message: 'Please select a point or area within the dataset boundary.',
          };
        default:
          return {
            level: 'error',
          };
      }
    })();

    if (reportLevel === 'error') {
      // Report critical error.
      Raven.captureMessage('Time-series data request error', {
        extra: {
          message: error.message,
          request: error.request,
          originalError: error.originalError,
          originalResponse: error.originalResponse,
        },
      });
    } else {
      // Report abnormal event.
      Raven.captureMessage('Time-series data request abnormal event', {
        level: reportLevel,
        extra: {
          niceErrorMessage,
          request: error.request,
          originalError: error.originalError,
          originalResponse: error.originalResponse,
        },
      });
    }

    this.setState({
      isLoadingTimeSeriesData: false,
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      timeSeriesDataRequestError: {
        raw: rawErrorMessage,
        nice: niceErrorMessage,
      },
      timeSeriesDataResponseDate: new Date(),
      isPendingTimeSeriesChartRender: false,
    });
  };

  onChartRenderStart = () => {
    console.log('AnalyticsTabContent.onChartRenderStart');

    this.setState({
      isPendingTimeSeriesChartRender: false,
      isRenderingTimeSeriesChart: true,
      timeSeriesChartRenderStartDate: new Date(),
    });
  };

  onChartRenderEnd = () => {
    console.log('AnalyticsTabContent.onChartRenderEnd');

    this.setState({
      isRenderingTimeSeriesChart: false,
      timeSeriesChartRenderEndDate: new Date(),
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
    console.log('AnalyticsTabContent.requestData', payload);

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
      console.log('Dependencies not met');
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
        //! Format these properly according to the temporal resolution of the dataset.
        start: () => moment(payload.dateRange[0]).format('YYYY'),
        end: () => moment(payload.dateRange[1]).format('YYYY'),
      },
      requestBody,
    );

    console.log('AnalyticsTabContent.requestData', 'requesting', remoteUrl, requestBody);

    this.setState({
      isLoadingTimeSeriesData: true,
      isTimeSeriesDataLoaded: false,
      timeSeriesData: null,
      timeSeriesDataRequestDate: new Date(),
      timeSeriesDataRequestError: null,
      timeSeriesDataResponseDate: null,
    });

    const exception = new Error('Unexpected error');

    exception.request = {
      method: 'post',
      url: remoteUrl,
      data: requestBody,
    };

    HTTP.post(
      remoteUrl,
      {
        json: true,
        data: requestBody,
      },
      (error, response) => {
        if (error) {
          exception.message = 'Error when requesting data';
          exception.originalError = error;
          reject(exception);
          return;
        }

        if (response.statusCode !== 200) {
          exception.message = 'Data not OK';
          exception.originalResponse = response;
          reject(exception);
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
      isPendingTimeSeriesChartRender,
      isRenderingTimeSeriesChart,
      timeSeriesChartRenderStartDate,
      timeSeriesChartRenderEndDate,
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
                  variableName={this.props.getVariableNameById(selectedVariableId)}
                  temporalResolution={dateResolution}
                  temporalPeriod={{
                    gte: dateRange[0],
                    lte: dateRange[1],
                  }}
                  data={timeSeriesData}
                  onRenderStart={this.onChartRenderStart}
                  onRenderEnd={this.onChartRenderEnd}
                  ref={(ref) => this._chartComponent = ref}
                />
              </CardMedia>
              <CardText>
                <div>Loaded in {moment.duration({
                  from: timeSeriesDataRequestDate,
                  to: timeSeriesDataResponseDate,
                }).asSeconds()} s.</div>
                {!isPendingTimeSeriesChartRender && !isRenderingTimeSeriesChart && (
                  <div>Rendered in {moment.duration({
                    from: timeSeriesChartRenderStartDate,
                    to: timeSeriesChartRenderEndDate,
                  }).asSeconds()} s.</div>
                )}
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
            <div>
              <div className="linear-progress" />
              <p>Please wait while the chart is being loaded...</p>
            </div>
          )}
          {!isLoadingTimeSeriesData && !isTimeSeriesDataLoaded && !timeSeriesDataRequestError && (
            <div>
              <p
                style={{
                  lineHeight: '1.5em',
                }}
              >Select <b>a variable</b> and <b>a valid point or area in the boundary</b> to view the time series data.</p>
            </div>
          )}
          {!isLoadingTimeSeriesData && !isTimeSeriesDataLoaded && timeSeriesDataRequestError && (
            <div>
              <WarningIcon
                color="red"
                style={{
                  float: 'left',
                  height: '1.5em',
                  width: '1.5em',
                  margin: '0 0.5em 0.5em 0',
                }}
              />
              {timeSeriesDataRequestError.nice
              ? (
                <p
                  style={{
                    lineHeight: '1.5em',
                  }}
                >{timeSeriesDataRequestError.nice}</p>
              )
              : (
                <React.Fragment>
                  <p
                    style={{
                      lineHeight: '1.5em',
                    }}
                  >Error when requesting the data: </p>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{timeSeriesDataRequestError.raw}</pre>
                </React.Fragment>
              )}
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

        getVariableNameById={this.getVariableNameById}
        getFrameIndexInTimespan={this.component.getFrameIndexInTimespan}
        renderVariableList={this.renderVariableList}
        renderTemporalControls={this.renderTemporalControls}
        renderFocusBoundaryMap={this.renderFocusBoundaryMap}
      />
    );
  }
}