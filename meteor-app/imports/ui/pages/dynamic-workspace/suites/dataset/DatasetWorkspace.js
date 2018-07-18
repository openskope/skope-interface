/* global HTMLMapLayerVector */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import objectPath from 'object-path';
import moment from 'moment';

import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import {
  ListItem,
} from 'material-ui/List';
import {
  RadioButton,
} from 'material-ui/RadioButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import ExpandIcon from 'material-ui/svg-icons/navigation/expand-more';
import CollapseIcon from 'material-ui/svg-icons/navigation/expand-less';

import {
  AllResolutionNames,
  getPrecisionByResolution,
  getDateStringAtPrecision,
  getDateAtPrecision,
  getDateStringSegments,
  parseDateStringWithPrecision,
  clampDateWithinRange,
  stringToNumber,
  buildGeoJsonWithGeometry,
} from '/imports/helpers/model';

import ToggleButton from '/imports/ui/components/ToggleButton';
import {
  SliderWithInput,
  RangeWithInput,
} from '/imports/ui/components/SliderWithInput';
import MapWithToolbar from '/imports/ui/components/MapWithToolbar';

import SuiteBaseClass from '../SuiteBaseClass';
import * as mapLayerRenderers from './mapLayerRenderers';
import * as mapLayerLegendRenderers from './mapLayerLegendRenderers';

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

export default
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
        gte: PropTypes.instanceOf(Date).isRequired,
        lte: PropTypes.instanceOf(Date).isRequired,
      }).isRequired,
    }).isRequired,
  });

  static defaultProps = {
    timespan: null,

    ...OverlayTab.defaultProps,
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

  static defaultVariableOpacity = 0.5;

  constructor (props) {
    super(props);

    this._suiteContextValue = {};
    this._tabRefs = {};

    /**
     * Search query state from the routing.
     * @type {Object}
     */
    const searchQuery = ((searchStateString) => {
      let searchState = null;

      try {
        searchState = JSON.parse(searchStateString);
      } catch (e) {
        return null;
      }

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
      /**
       * Date range of the dataset.
       * @type {[Date, Date]}
       */
      const datasetDateRange = [
        this.timespan.period.gte,
        this.timespan.period.lte,
      ];
      const queryDateRange = [
        objectPath.get(searchQuery, 'timespan.min'),
        objectPath.get(searchQuery, 'timespan.max'),
      ].map((dateString) => {
        // `dateString` could be undefined.
        if (typeof dateString === 'undefined') {
          return null;
        }

        try {
          return parseDateStringWithPrecision(dateString, 0);
        } catch (e) {
          return null;
        }
      });
      const isValidQueryDateRange = queryDateRange.every((date) => date !== null);

      if (!isValidQueryDateRange) {
        return datasetDateRange;
      }

      // Query date range is restricted by dataset date range.
      const dateRange = [
        clampDateWithinRange(queryDateRange[0], ...datasetDateRange),
        clampDateWithinRange(queryDateRange[1], ...datasetDateRange),
      ];

      return dateRange;
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
    this.state = {
      /**
       * The ID of the currently selected variable.
       * If need default selection, configure it here.
       * Empty string denotes null selection.
       * @type {string}
       */
      idOfTheSelectedVariable: '',

      // @type {Object<variableId: string, opacity: number>}
      mapOfOpacityOfVariable: {},

      // @type {Object<variableId: string, stylingRange: [Date, Date]>}
      mapOfRangeOfVariableStyling: {},

      /**
       * A collection of boolean values indicating if a panel is open.
       * When there is no value for a specific key, the default state is up to the reader's interpretation.
       * @type {Object<boolean>}
       */
      mapOfOpenStatusOfPanel: {},

      /**
       * Range of the current selection.
       * This tuple-style structure is used by the slider component.
       * Since the slider is a high-update-frequency component, it's better to reduce the amount of conversion necessary.
       * @type {[Date, Date]}
       */
      dateRangeOfFocus: initialDateRange,

      /**
       * This should be an exact copy of `dateRangeOfFocus` but gets updated much frequently more by the sliders.
       */
      animatedCopyOfDateRangeOfFocus: initialDateRange,

      /**
       * The date of the currently selected time frame/band.
       * This affects what layers are displayed in the map view and the graph view.
       * @type {Date}
       */
      dateOfTheCurrentlyDisplayedFrame: initialDateRange[0],

      /**
       * The geometry of the area of interest.
       * This determines the highlighted area of the map view and the study area of the graph view.
       * @type {Object}
       */
      geometryOfFocus: initialFocusGeometry,

      // @type {string}
      nameOfTheActiveTab: tabConstructs.infoTab.tabName,
    };
  }

  /**
   * @param {Event} event
   * @param {[Date, Date]} newDateRange
   */
  onChangeDateRangeOfFocus = _.throttle((event, newDateRange) => {
    const preciseDateRange = newDateRange.map(this.getPreciseDateWithinTimespan);

    this.animatedCopyOfDateRangeOfFocus = preciseDateRange;
  }, 0);

  /**
   * @param {Event} event
   * @param {[Date, Date]} newDateRange
   */
  onFinishChangingDateRangeOfFocus = (event, newDateRange) => {
    const preciseDateRange = newDateRange.map(this.getPreciseDateWithinTimespan);

    this.dateRangeOfFocus = preciseDateRange;
  };

  /**
   * @return {string}
   */
  get idOfTheSelectedVariable () {
    return this.state.idOfTheSelectedVariable;
  }
  set idOfTheSelectedVariable (value) {
    this.setState({
      idOfTheSelectedVariable: value,
    });
  }
  /**
   * @return {boolean}
   */
  get hasSelectedVariable () {
    return this.idOfTheSelectedVariable !== '';
  }

  /**
   * @type {{resolution: string, period: {gte: Date, lte: Date}}}
   */
  get timespan () {
    return this.props.timespan;
  }

  /**
   * 0: year
   * 1: month
   * 2: day
   * ...
   * @type {number}
   */
  get temporalPrecision () {
    return getPrecisionByResolution(this.timespan.resolution);
  }

  /**
   * @type {Object|null}
   */
  get geometryOfDataBoundary () {
    return objectPath.get(this.props.region, 'geometry', null);
  }

  /**
   * @type {Object|null}
   */
  get geoJsonOfDataBoundary () {
    return buildGeoJsonWithGeometry(this.geometryOfDataBoundary);
  }

  /**
   * If `extents` is specified in source, trust that. Otherwise try to calculate from boundary shape.
   * @type {Array<number>}
   */
  get extentOfDataBoundary () {
    const boundaryExtentFromDocument = objectPath.get(this.props.region, 'extents');

    if (boundaryExtentFromDocument) {
      return boundaryExtentFromDocument.map((s) => parseFloat(s));
    }

    const geometryOfDataBoundary = this.geometryOfDataBoundary;

    if (!geometryOfDataBoundary) {
      return null;
    }

    const extent = HTMLMapLayerVector.getExtentFromGeometry(geometryOfDataBoundary, HTMLMapLayerVector.IOProjection);

    return extent;
  }

  /**
   * @type {Object<string, Object>}
   */
  get variables () {
    return this.props.variables;
  }

  /**
   * @return {Object}
   */
  get geometryOfFocus () {
    return this.state.geometryOfFocus;
  }
  set geometryOfFocus (value) {
    this.setState({
      geometryOfFocus: value,
    });
  }

  /**
   * @return {Date}
   */
  get dateOfTheCurrentlyDisplayedFrame () {
    return this.state.dateOfTheCurrentlyDisplayedFrame;
  }
  set dateOfTheCurrentlyDisplayedFrame (value) {
    const [
      dateRangeStart,
      dateRangeEnd,
    ] = this.dateRangeOfFocus;
    let preciseDate = this.getPreciseDateWithinTimespan(value);

    preciseDate = clampDateWithinRange(preciseDate, dateRangeStart, dateRangeEnd);

    if (preciseDate.valueOf() === this.dateOfTheCurrentlyDisplayedFrame.valueOf()) {
      return;
    }

    this.setState({
      dateOfTheCurrentlyDisplayedFrame: preciseDate,
    });
  }

  /**
   * @return {[Date, Date]}
   */
  get animatedCopyOfDateRangeOfFocus () {
    return this.state.animatedCopyOfDateRangeOfFocus;
  }
  set animatedCopyOfDateRangeOfFocus (value) {
    this.setState({
      animatedCopyOfDateRangeOfFocus: value,
    });
  }

  /**
   * Setting date range also updates current loaded date to make sure the
   * current loaded date is not outside of the date range.
   * @return {[Date, Date]}
   */
  get dateRangeOfFocus () {
    return this.state.dateRangeOfFocus;
  }
  set dateRangeOfFocus (value) {
    let dateOfTheCurrentlyDisplayedFrame = this.dateOfTheCurrentlyDisplayedFrame;

    dateOfTheCurrentlyDisplayedFrame = clampDateWithinRange(dateOfTheCurrentlyDisplayedFrame, value[0], value[1]);

    this.setState({
      dateRangeOfFocus: value,
      dateOfTheCurrentlyDisplayedFrame,
    });
  }

  /**
   * Make sure the given date stays within the dataset timespan and has the proper resolution.
   * @param {Date} date
   * @returns {Date}
   */
  getPreciseDateWithinTimespan = (date) => {
    let preciseDate = getDateAtPrecision(date, this.temporalPrecision);

    if (preciseDate.valueOf() > this.timespan.period.lte.valueOf()) {
      preciseDate = this.timespan.period.lte;
    }

    if (preciseDate.valueOf() < this.timespan.period.gte.valueOf()) {
      preciseDate = this.timespan.period.gte;
    }

    return preciseDate;
  };

  getVariableNameById = (variableId) => {
    const variable = this.variables[variableId];

    if (typeof variable === 'undefined') {
      return null;
    }

    return variable.name;
  };

  /**
   * @param {string} variableId
   * @returns {number}
   */
  getVariableOpacity (variableId) {
    return objectPath.get(this.state.mapOfOpacityOfVariable, variableId, this.constructor.defaultVariableOpacity);
  }

  /**
   * @param {string} variableId
   * @param {number} opacity
   */
  setVariableOpacity (variableId, opacity) {
    const mapOfOpacityOfVariable = _.cloneDeep(this.state.mapOfOpacityOfVariable);

    objectPath.set(mapOfOpacityOfVariable, variableId, opacity);

    this.setState({
      mapOfOpacityOfVariable,
    });
  }

  /**
   * @param {string} variableId
   * @returns {[Date, Date]|null}
   */
  getVariableStylingRange (variableId, defaultValue = null) {
    return objectPath.get(this.state.mapOfRangeOfVariableStyling, variableId, defaultValue);
  }

  /**
   * @param {string} variableId
   * @param {[Date, Date]|null} range
   */
  setVariableStylingRange (variableId, range) {
    const mapOfRangeOfVariableStyling = _.cloneDeep(this.state.mapOfRangeOfVariableStyling);

    objectPath.set(mapOfRangeOfVariableStyling, variableId, range);

    this.setState({
      mapOfRangeOfVariableStyling,
    });
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

  /**
   * @param {Date} date
   * @returns {number}
   */
  getSliderValueFromDate = (date) => this.getFrameIndexInTimespan(date);

  /**
   * @param {number} value
   * @return {Date}
   */
  getDateFromSliderValue = (value) => this.getDateFromFrameIndex(value);

  getInputValueFromDate = (date) => {
    return this.buildPreciseDateString(date);
  };

  /**
   * @param {string} s
   * @return {Date}
   */
  getDateFromInputValue = (s) => {
    return this.parsePreciseDateString(s);
  };

  setActiveTab = (newTab) => {
    const currentTab = this.state.nameOfTheActiveTab;

    console.log('setActiveTab', `${currentTab} -> ${newTab}`, this._tabRefs);

    this.setState({
      nameOfTheActiveTab: newTab,
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
    return getDateStringAtPrecision(date, this.temporalPrecision);
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
    );
  };

  /**
   * Returns true if the variable is selected.
   * @param {string} variableId
   * @returns {boolean}
   */
  isSelectedVariable (variableId) {
    return variableId === this.idOfTheSelectedVariable;
  }

  /**
   * @param {string} panelId
   * @returns {boolean}
   */
  isPanelOpen = (panelId, defaultState = true) => {
    return objectPath.get(this.state.mapOfOpenStatusOfPanel, panelId, defaultState);
  };

  /**
   * @param {string} panelId
   */
  togglePanelOpenState = (panelId, setTo = !this.isPanelOpen(panelId)) => {
    const mapOfOpenStatusOfPanel = _.cloneDeep(this.state.mapOfOpenStatusOfPanel);

    objectPath.set(mapOfOpenStatusOfPanel, panelId, setTo);

    this.setState({
      mapOfOpenStatusOfPanel,
    });
  };

  SidePanelCommonCollapsibleSectionContainer = (props) => {
    const {
      id = '',
      label = '',
      children = null,
    } = props;
    const isNestedItemsVisible = this.isPanelOpen(id, true);
    const toggleNestedItemsVisible = () => this.togglePanelOpenState(id, !isNestedItemsVisible);

    return (
      <ListItem
        key={id}
        autoGenerateNestedIndicator={false}
        leftIcon={isNestedItemsVisible ? <CollapseIcon /> : <ExpandIcon />}
        primaryText={label}
        primaryTogglesNestedList
        open={isNestedItemsVisible}
        onNestedListToggle={toggleNestedItemsVisible}
        nestedItems={Array.isArray(children) ? children : [children]}
      />
    );
  };

  /**
   * This component is closely associated with the dataset so it can not be
   * independent.
   * Use the `props` parameter to pass customizable options.
   * @param {Object} props
   */
  renderVariableList = () => {
    const variableListItems = Object.entries(this.variables)
    .map(([variableId, variable]) => {
      const itemId = `variable-list-item__${variableId}`;
      const isConfigOptionsVisible = this.isPanelOpen(itemId, false);
      const toggleConfigOptionsVisible = () => this.togglePanelOpenState(itemId, !isConfigOptionsVisible);

      return (
        <ListItem
          key={itemId}
          className="variable-list__item"
          leftCheckbox={(
            <RadioButton
              value={variableId}
              checked={this.isSelectedVariable(variableId)}
              onCheck={() => this.idOfTheSelectedVariable = variableId}
            />
          )}
          primaryText={variable.name}
          style={{
            // This value should be 20px more than the width of the right icon button.
            paddingRight: '120px',
          }}
          rightIconButton={(
            <ToggleButton
              icon={(
                <SettingsIcon />
              )}
              toggled={isConfigOptionsVisible}
              onToggle={toggleConfigOptionsVisible}
              style={{
                color: 'rgba(0, 0, 0, 0.5)',
                top: '9px',
                width: false,
              }}
            />
          )}
          open={isConfigOptionsVisible}
          nestedItems={[
            <ListItem
              disabled
              key="variable-opacity"
              style={{
                padding: '0',
              }}
            >
              <SliderWithInput
                label="Opacity"
                min={0}
                max={1}
                step={0.01}
                value={this.getVariableOpacity(variableId)}
                toSliderValue={(v) => v * 100}
                fromSliderValue={(v) => v / 100}
                toInputValue={(v) => `${(v * 100).toFixed(0)}%`}
                fromInputValue={(v) => {
                  // We want to support both format `{N}%` and `{N}`.
                  let str = v;

                  if (str[str.length - 1] === '%') {
                    str = str.slice(0, -1);
                  }

                  if (isNaN(str)) {
                    throw new Error('Invalid number.');
                  }

                  return parseFloat(str) / 100;
                }}
                onChange={(event, newValue) => this.setVariableOpacity(variableId, newValue)}
                inputStyle={{
                  width: '60px',
                }}
                sliderProps={{
                  included: false,
                  handleStyle: [
                    {
                      transform: 'scale(1.4)',
                    },
                  ],
                }}
              />
            </ListItem>,

            <ListItem
              disabled
              key="overlay-style-range"
              style={{
                padding: '0',
              }}
            >
              <RangeWithInput
                disabled
                label="Overlay range"
                min={variable.overlay.min}
                max={variable.overlay.max}
                value={this.getVariableStylingRange(variableId, [variable.overlay.min, variable.overlay.max])}
                onChange={(event, newValue) => this.setVariableStylingRange(variableId, newValue)}
                inputStyle={{
                  width: '60px',
                }}
                sliderProps={{
                  handleStyle: [
                    {
                      transform: 'scale(1.4)',
                    },
                  ],
                }}
                inputProps={{
                  type: 'number',
                  min: variable.overlay.min,
                  max: variable.overlay.max,
                }}
              />
            </ListItem>,

            <ListItem
              key="overlay-style"
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
                    disabled
                    value={0}
                    style={{
                      width: '100%',
                    }}
                  >{variable.overlay.styles.map((styleName) => (
                    <MenuItem
                      key={styleName}
                      value={styleName}
                      primaryText={styleName}
                    />
                  ))}</SelectField>
                </div>
              )}
            />,
          ]}
        />
      );
    });

    return (
      <this.SidePanelCommonCollapsibleSectionContainer
        id="variable-list"
        label="Select variable to display"
      >{variableListItems}</this.SidePanelCommonCollapsibleSectionContainer>
    );
  };

  /**
   * This component is closely associated with the dataset so it can not be
   * independent.
   * Use the `props` parameter to pass customizable options.
   * @param {Object} props
   */
  renderTemporalControls = (props = {}) => {
    const {
      disabled = false,
    } = props;
    const timespan = this.timespan;

    const controls = [
      <ListItem
        disabled
        key="date-range"
        style={{
          padding: '0',
        }}
      >
        <RangeWithInput
          label={`Date Range (${timespan.resolution})`}
          min={timespan.period.gte}
          max={timespan.period.lte}
          value={this.animatedCopyOfDateRangeOfFocus}
          disabled={disabled}
          // (Date) => number
          toSliderValue={this.getSliderValueFromDate}
          // (number) => Date
          fromSliderValue={this.getDateFromSliderValue}
          // (Date) => string
          toInputValue={this.getInputValueFromDate}
          // (string) => Date
          fromInputValue={this.getDateFromInputValue}
          onChange={this.onChangeDateRangeOfFocus}
          onFinish={this.onFinishChangingDateRangeOfFocus}
          inputStyle={{
            width: '60px',
          }}
          sliderProps={{
            handleStyle: [
              {
                transform: 'scale(1.4)',
              },
            ],
          }}
          inputProps={{
            type: 'text',
            min: this.getInputValueFromDate(timespan.period.gte),
            max: this.getInputValueFromDate(timespan.period.lte),
          }}
        />
      </ListItem>,
    ];

    return (
      <this.SidePanelCommonCollapsibleSectionContainer
        id="temporal-controls"
        label="Temporal controls"
      >{controls}</this.SidePanelCommonCollapsibleSectionContainer>
    );
  };

  renderBoundaryOverlay = () => {
    const geoJsonOfDataBoundary = this.geoJsonOfDataBoundary;
    const geoJsonStringOfDataBoundary = geoJsonOfDataBoundary && JSON.stringify(geoJsonOfDataBoundary);

    return (
      <map-layer-geojson
        style={{
          strokeColor: 'red',
        }}
        src-json={geoJsonStringOfDataBoundary}
        src-projection="EPSG:4326"
      />
    );
  };

  /**
   * Requires component as context object.
   * @param {Object} layer
   */
  renderMapLayer = (layer) => {
    const {
      type: layerType,
      name: layerName,
    } = layer;

    if (!(layerType in mapLayerRenderers)) {
      console.warn(`Unknown layer type “${layerType}” for layer “${layerName}”`);
      return null;
    }

    const renderer = mapLayerRenderers[layerType];
    // @type {Date}
    const dateOfLayer = (typeof this.dateOfTheCurrentlyDisplayedFrame === 'undefined' || this.dateOfTheCurrentlyDisplayedFrame === null)
                        ? this.timespan.period.gte
                        : this.dateOfTheCurrentlyDisplayedFrame;

    return renderer.call(this, {
      ...layer,
      extent: this.extentOfDataBoundary,
      visible: this.isSelectedVariable(layerName),
      opacity: this.getVariableOpacity(layerName),
    }, {
      YYYY: () => getDateStringSegments(dateOfLayer)[0],
      MM: () => getDateStringSegments(dateOfLayer)[1],
      DD: () => getDateStringSegments(dateOfLayer)[2],
    });
  };

  renderMapLayerLegend = (layer, options = {}) => {
    const {
      type: layerType,
      name: layerName,
    } = layer;

    if (!(layerType in mapLayerLegendRenderers)) {
      console.warn(`Unknown layer type “${layerType}” for layer “${layerName}”`);
      return null;
    }

    const renderer = mapLayerLegendRenderers[layerType];
    // @type {Date}
    const dateOfLayer = (typeof this.dateOfTheCurrentlyDisplayedFrame === 'undefined' || this.dateOfTheCurrentlyDisplayedFrame === null)
                        ? this.timespan.period.gte
                        : this.dateOfTheCurrentlyDisplayedFrame;

    return renderer.call(this, {
      ...layer,
      ...options,
    }, {
      YYYY: () => getDateStringSegments(dateOfLayer)[0],
      MM: () => getDateStringSegments(dateOfLayer)[1],
      DD: () => getDateStringSegments(dateOfLayer)[2],
    });
  };

  renderBaseMapLayer = (layer) => {
    const {
      type: layerType,
      name: layerName,
    } = layer;

    if (!(layerType in mapLayerRenderers)) {
      console.warn(`Unknown layer type “${layerType}” for layer “${layerName}”`);
      return null;
    }

    const renderer = mapLayerRenderers[layerType];

    return renderer.call(this, {
      ...layer,
      visible: true,
    });
  };

  renderMapLayerForSelectedVariable = (options = {}) => {
    const {
      legend: shouldRenderLegend = false,
      legendStyle = {},
    } = options;
    const variableId = this.idOfTheSelectedVariable;
    const layer = objectPath.get(this.variables, [variableId, 'overlay']);

    if (!layer) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderMapLayer(layer)}
        {shouldRenderLegend && this.renderMapLayerLegend(layer, {
          legendStyle,
        })}
      </React.Fragment>
    );
  };

  renderFocusBoundaryMap = (props = {}) => {
    const {
      key = 'focus-boundary',
      title = 'Select analytics boundary',
      // @type {Array<{name: string, IconClass: Icon, [drawingType: string]}>}
      selectionTools = [],
    } = props;

    return (
      <this.SidePanelCommonCollapsibleSectionContainer
        id={key}
        label={title}
      >
        <ListItem
          disabled
          key="map"
        >
          <MapWithToolbar
            id={key}
            selectionTools={selectionTools}
            defaultExtent={this.extentOfDataBoundary}
            geometryOfFocus={this.geometryOfFocus}
            updateGeometryOfFocus={(geom) => this.geometryOfFocus = geom}
          >
            {this.hasSelectedVariable && this.renderMapLayerForSelectedVariable()}
            {this.renderBoundaryOverlay()}
            <map-control-mouse-position slot="right-dock" />
          </MapWithToolbar>
        </ListItem>
      </this.SidePanelCommonCollapsibleSectionContainer>
    );
  };

  /**
   * A tab is enabled when all of its required props are available on the dataset.
   * @param {React.Component} TabComponent
   * @return {boolean}
   */
  isTabEnabled (TabComponent) {
    return TabComponent.requiredProps.every((key) => {
      return key in this.props && this.props[key];
    });
  }

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

  renderTab (TabComponent, props) {
    const tabIsEnabled = this.isTabEnabled(TabComponent);
    const currentTab = this.state.nameOfTheActiveTab;
    const tabIsActive = currentTab === TabComponent.tabName;

    return (
      <Tab
        {...props}
        className="tab-button"
        label={this.renderTabLabel({
          IconComponent: TabComponent.tabIcon,
          label: TabComponent.tabLabel,
        })}
        value={TabComponent.tabName}
        disabled={!tabIsEnabled}
        style={{
          cursor: false,
          ...TabComponent.tabStyle,
        }}
      >{tabIsEnabled && tabIsActive && (
        <TabComponent
          {...this.props}
          workspace={this}
          ref={(ref) => this._tabRefs[TabComponent.tabName] = ref}
        />
      )}</Tab>
    );
  }

  renderTabs () {
    return Object.entries(tabConstructs).map(([key, TabComponent]) => {
      return this.renderTab(TabComponent, {
        key,
      });
    });
  }

  render () {
    const tabBarBackgroundColor = objectPath.get(this.props, 'muiTheme.tabs.inkBarColor', 'white');

    return (
      <Paper
        className="suite-wrapper"
      >
        <Tabs
          className="tabs-panel"
          contentContainerClassName="tabs-panel__content"
          value={this.state.nameOfTheActiveTab}
          inkBarStyle={{
            backgroundColor: tabBarBackgroundColor,
          }}
          onChange={this.onTabChange}
        >{this.renderTabs()}</Tabs>
      </Paper>
    );
  }
}
