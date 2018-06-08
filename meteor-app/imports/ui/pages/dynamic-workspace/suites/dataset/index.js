import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import objectPath from 'object-path';
import moment from 'moment';
import geojsonExtent from 'geojson-extent';

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
  stringToNumber,
} from '/imports/ui/helpers';

import SuiteBaseClass from '../SuiteBaseClass';

import DiscoverTab from './tabs/discover';
import InfoTab from './tabs/info';
import DownloadTab from './tabs/download';
import OverlayTab from './tabs/overlay';
import AnalyticsTab from './tabs/analytics';
import ModelTab from './tabs/model';

// Expose this collection in case other components need to know about the tabs and their order.
export const tabConstructs = {
  discoverTab: DiscoverTab,
  infoTab: InfoTab,
  overlayTab: OverlayTab,
  analyticsTab: AnalyticsTab,
  downloadTab: DownloadTab,
  modelTab: ModelTab,
};

class DatasetWorkspace extends SuiteBaseClass {

  static propTypes = SuiteBaseClass.extendPropTypes({
    variables: PropTypes.objectOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })).isRequired,
    region: PropTypes.shape({
      name: PropTypes.string,
      extents: PropTypes.arrayOf(PropTypes.number),
      resolution: PropTypes.string,
      geometry: PropTypes.object,
    }).isRequired,
    timespan: PropTypes.shape({
      resolution: PropTypes.oneOf(AllResolutionNames).isRequired,
      precision: PropTypes.number.isRequired,
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
      }).isRequired,
    }).isRequired,

    ...OverlayTab.propTypes,
  });

  static defaultProps = {
    timespan: null,

    ...OverlayTab.defaultProps,
  };

  static dateFormatForPrecisions = [
    'YYYY',
    'YYYY-MM',
    'YYYY-MM-DD',
  ];

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

  static getTimespan = (resolution, period) => {
    const datePrecision = getPrecisionByResolution(resolution);

    return {
      resolution,
      period: {
        gte: parseDateStringWithPrecision(period.gte, datePrecision),
        lte: parseDateStringWithPrecision(period.lte, datePrecision),
      },
    };
  };

  constructor (props) {
    super(props);

    this._tabs = Object.entries(tabConstructs)
    .reduce((acc, [id, Construct]) => {
      return {
        ...acc,
        [id]: new Construct(this, id),
      };
    }, {});

    /**
     * Search query state from the routing.
     * @type {Object}
     */
    const searchQuery = ((searchStateString) => {
      let searchState = null;

      try {
        searchState = JSON.parse(searchStateString);
      } catch (e) {}

      return searchState;
    })(objectPath.get(props, 'routing.queryParams.q'));

    console.log('searchQuery', searchQuery);

    /**
     * Initial date range decided from various factors.
     * If a range is specified in the search query, use that.
     * Otherwise use the date range from the dataset.
     * @type {[Date, Date]}
     */
    const initialDateRange = (() => {
      const queryDateRange = [
        parseDateStringWithPrecision(objectPath.get(searchQuery, 'timespan.min'), 0),
        parseDateStringWithPrecision(objectPath.get(searchQuery, 'timespan.max'), 0),
      ];
      const isValidQueryDateRange = queryDateRange.every((date) => date !== null);

      if (isValidQueryDateRange) {
        return queryDateRange;
      }

      /**
       * Date range of the dataset.
       * @type {[Date, Date]}
       */
      const datasetDateRange = [
        this.timespan.period.gte,
        this.timespan.period.lte,
      ];

      return datasetDateRange;
    })();

    console.log('initialDateRange', initialDateRange);

    const initialFocusGeometry = (() => {
      const queryShape = objectPath.get(searchQuery, 'location', null);

      if (queryShape && queryShape.shape) {
        const geometryWithNumbers = stringToNumber(queryShape.shape);

        return geometryWithNumbers;
      }

      return null;
    })();

    console.log('initialFocusGeometry', initialFocusGeometry);

    /**
     * This is a deep merge so `.getInitialStateForParent` could return state for multiple namespaces,
     * and all of the namespaces returned from different tabs would be merged.
     * ! Should it warn about collisions?
     */
    this.state = _.merge({
      // These state properties are shared across multiple tabs.
      // Check `tabs/BaseClass.js` for helper getters and setters.
      _shared: {
        /**
         * The ID of the currently selected variable.
         * If need default selection, configure it here.
         * Empty string denotes null selection.
         * @type {string}
         */
        selectedVariableId: '',
        // @type {Object<variableId: string, opacity: number>}
        variableOpacity: {},
        // @type {Object<variableId: string, stylingRange: [Date, Date]>}
        variableStylingRange: {},
        /**
         * A collection of boolean values indicating if a panel is open.
         * When there is no value for a specific key, the default state is up to the reader's interpretation.
         * @type {Object<boolean>}
         */
        isPanelOpen: {},
        /**
         * Range of the current selection.
         * This tuple-style structure is used by the slider component.
         * Since the slider is a high-update-frequency component, it's better to reduce the amount of convertion necessary.
         * @type {[Date, Date]}
         */
        dateRange: initialDateRange,
        /**
         * This should be an exact copy of `dateRange` but gets updated much frequently more by the sliders.
         */
        dateRangeTemporal: initialDateRange,
        /**
         * The date of the currently selected time frame/band.
         * This affects what layers are displayed in the map view and the graph view.
         * @type {Date}
         */
        currentLoadedDate: initialDateRange[0],
        /**
         * The geometry of the area of interest.
         * This determines the highlighted area of the map view and the study area of the graph view.
         * @type {Object}
         */
        focusGeometry: initialFocusGeometry,
      },

      // @type {string}
      activeTab: this._tabs.infoTab.name,
    }, ...(Object.values(this._tabs).map((tab) => tab.getInitialStateForParent())));
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

    return DatasetWorkspace.getTimespan(resolution, period);
  }

  /**
   * @type {number}
   */
  get temporalPrecision () {
    return getPrecisionByResolution(this.timespan.resolution);
  }

  /**
   * @type {Object|null}
   */
  get boundaryGeometry () {
    return objectPath.get(this.props.region, 'geometry', null);
  }

  /**
   * @type {Object|null}
   */
  get boundaryGeoJson () {
    return buildGeoJsonWithGeometry(this.boundaryGeometry);
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
    return this.props.variables;
  }

  /**
   * @param {Date} date
   * @return {number}
   */
  getFrameIndexInTimespan = (date) => {
    const timespan = this.timespan;
    const baseDate = timespan.period.gte;
    //! This logic needs to be fixed to avoid rounding errors.
    //! Instead of using difference in milliseconds, perhaps first get integer
    //! year value and then get the difference in years.
    //! The millisecond difference between 1000 and 2000 may not be a whole 1000 years.
    const sliderRawValue = moment.duration(date - baseDate).as(timespan.resolution);
    const integerValue = Math.round(sliderRawValue);

    return integerValue;
  };

  /**
   * @param {number} value
   * @return {Date}
   */
  getDateFromFrameIndex = (value) => {
    const timespan = this.timespan;
    const baseDate = timespan.period.gte;
    const valueDate = moment(baseDate).add(value, timespan.resolution).toDate();

    return valueDate;
  };

  setActiveTab = (newTab) => {
    if (!(newTab in this._tabs)) {
      throw new Error('Unknown tab.');
    }

    const currentTab = this.state.activeTab;

    const event = new CustomEvent('build', {
      detail: {
        fromTab: currentTab,
        toTab: newTab,
      },
      bubbles: false,
      cancelable: false,
    });

    console.log('setActiveTab', `${event.detail.fromTab} -> ${event.detail.toTab}`);

    this._tabs[currentTab].onDeactivate(event);
    this._tabs[newTab].onActivate(event);

    this.setState({
      activeTab: newTab,
    });
  }

  onTabChange = (nextTabValue) => {
    this.setActiveTab(nextTabValue);

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
    return getDateStringAtPrecision(
      date,
      this.temporalPrecision,
      DatasetWorkspace.dateFormatForPrecisions,
    );
  };

  /**
   * Does the oppsite of `#buildPreciseDateString`.
   * @param  {string} dateString
   * @return {Date}
   */
  parsePreciseDateString = (dateString) => {
    return parseDateStringWithPrecision(
      dateString,
      this.temporalPrecision,
      DatasetWorkspace.dateFormatForPrecisions,
    );
  };

  renderTabLabel = ({
    IconComponent,
    label,
  }) => (
    <div className="tab-label">
      {IconComponent && (
        <IconComponent
          style={{
            color: 'inherit',
          }}
        />
      )}
      <span>{label}</span>
    </div>
  );

  renderTabs () {
    return Object.entries(this._tabs).map(([key, tab]) => {
      const reactElement = tab.render();
      return React.cloneElement(reactElement, {
        key,
      });
    });
  }

  render () {
    return (
      <Paper
        className="suite-wrapper"
      >
        <Tabs
          className="tabs-panel"
          contentContainerClassName="tabs-panel__content"
          value={this.state.activeTab}
          inkBarStyle={{
            backgroundColor: this.props.muiTheme.tabs.inkBarColor,
          }}
          onChange={this.onTabChange}
        >{this.renderTabs()}</Tabs>
      </Paper>
    );
  }
}

export default muiThemeable()(DatasetWorkspace);
