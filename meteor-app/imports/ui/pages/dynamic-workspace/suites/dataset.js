import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import objectPath from 'object-path';
import geojsonExtent from 'geojson-extent';
import mem from 'mem';

import muiThemeable from 'material-ui/styles/muiThemeable';
import {
  Tabs,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';

import {
  getPrecisionByResolution,
  getDateStringAtPrecision,
  parseDateStringWithPrecision,
  buildGeoJsonWithGeometry,
  AllResolutionNames,
} from '/imports/ui/helpers';

import SuiteBaseClass from './SuiteBaseClass';

import InfoTab from './dataset.info';
import DownloadTab from './dataset.download';
import OverlayTab from './dataset.overlay';
import AnalyticsTab from './dataset.analytics';
import ModelTab from './dataset.model';
import MetadataTab from './dataset.metadata';

class Component extends SuiteBaseClass {

  static propTypes = SuiteBaseClass.extendPropTypes({
    variables: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
      description: PropTypes.string,
    })),
    region: PropTypes.shape({
      name: PropTypes.string,
      extents: PropTypes.arrayOf(PropTypes.number),
      resolution: PropTypes.string,
      geometry: PropTypes.object,
    }),
    timespan: PropTypes.shape({
      resolution: PropTypes.oneOf(AllResolutionNames),
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

    ...OverlayTab.propTypes,

    // status: PropTypes.string,
    // description: PropTypes.string,
    // dataExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
    // dataUrl: PropTypes.string.isRequired,
    // layers: PropTypes.array.isRequired,
    // metadata: PropTypes.object,
  });

  static defaultProps = {
    timespan: null,

    ...OverlayTab.defaultProps,

    // status: 'undefined',
    // description: '',
    // metadata: {},
  };

  /**
   * @param {string} urlTemplate
   * @param {Object<placeHolder: string, value: *} values
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

  static memGetTimespan = mem((resolution, period) => {
    const datePrecision = getPrecisionByResolution(resolution);

    return {
      resolution,
      period: {
        gte: parseDateStringWithPrecision(period.gte, datePrecision),
        lte: parseDateStringWithPrecision(period.lte, datePrecision),
      },
    };
  });

  static memGetVariables = mem((variables, { overlays, analytics }) => {
    const mapOfOverlays = _.keyBy(overlays, 'name');
    const mapOfAnalytics = _.keyBy(analytics, 'name');

    const fullVariables = variables.map((v) => {
      return {
        ...v,
        overlay: mapOfOverlays[v.name],
        analytics: mapOfAnalytics[v.name],
      };
    });

    const mapOfFullVariables = _.keyBy(fullVariables, 'name');

    return mapOfFullVariables;
  });

  constructor (props) {
    super(props);

    this.infoTab = new InfoTab(this, 'InfoTab');
    this.downloadTab = new DownloadTab(this, 'DownloadTab');
    this.overlayTab = new OverlayTab(this, 'OverlayTab');
    this.analyticsTab = new AnalyticsTab(this, 'AnalyticsTab');
    this.modelTab = new ModelTab(this, 'ModelTab');
    this.metadataTab = new MetadataTab(this, 'MetadataTab');

    this.state = {
      // @type {string}
      activeTab: 'info',

      ...this.overlayTab.getInitialStateForParent(),
      ...this.analyticsTab.getInitialStateForParent(),
    };
  }

  /**
   * @type {{resolution: string, period: {gte: Date, lte: Date}}}
   */
  get timespan () {
    const {
      timespan: {
        resolution,
        period,
      },
    } = this.props;

    return Component.memGetTimespan(resolution, period);
  }

  /**
   * @type {number}
   */
  get temporalPrecision () {
    return getPrecisionByResolution(this.timespan.resolution);
  }

  /**
   * @type {Object}
   */
  get boundaryGeoJson () {
    const boundaryGeometry = objectPath.get(this.props.region, 'geometry');

    if (!boundaryGeometry) {
      return null;
    }

    return buildGeoJsonWithGeometry(boundaryGeometry);
  }

  /**
   * If `extents` is specified in source, trust that. Otherwise try to calculate from boundary shape.
   * @type {Array<number>}
   */
  get extent () {
    const boundaryExtentFromDocument = objectPath.get(this.props.region, 'extents');

    if (boundaryExtentFromDocument) {
      return boundaryExtentFromDocument.map((s) => parseFloat(s));
    }

    const boundaryGeoJson = this.boundaryGeoJson;

    if (!boundaryGeoJson) {
      return null;
    }

    return geojsonExtent(boundaryGeoJson);
  }

  /**
   * @type {Object<string, Object>}
   */
  get variables () {
    const variables = objectPath.get(this.props, 'variables', []);
    const overlays = objectPath.get(this.props, 'overlays', []);
    const analytics = objectPath.get(this.props, 'analytics', []);

    return Component.memGetVariables(variables, {
      overlays,
      analytics,
    });
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
   * Build a date string of the date with the precision of the current dataset.
   * @param  {Date} date
   * @return {string}
   */
  buildPreciseDateString = (date) => {
    return getDateStringAtPrecision(date, this.temporalPrecision, [
      'YYYY',
      'YYYY-MM',
      'YYYY-MM-DD',
    ]);
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
          {this.infoTab.render()}
          {this.downloadTab.render()}
          {this.overlayTab.render()}
          {this.analyticsTab.render()}
          {this.modelTab.render()}
          {this.metadataTab.render()}
        </Tabs>
      </Paper>
    );
  }
}

export default muiThemeable()(Component);
