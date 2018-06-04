/* eslint class-methods-use-this: off */

import React from 'react';
import objectPath from 'object-path';
import moment from 'moment';
import {
  Tab,
} from 'material-ui/Tabs';
import {
  ListItem,
} from 'material-ui/List';
import {
  RadioButton,
} from 'material-ui/RadioButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import ImageStyleIcon from 'material-ui/svg-icons/image/style';
import ExpandIcon from 'material-ui/svg-icons/navigation/expand-more';
import CollapseIcon from 'material-ui/svg-icons/navigation/expand-less';

import {
  getDateAtPrecision,
  getYearStringFromDate,
  clampDateWithinRange,
} from '/imports/helpers/model';

import ToggleButton from '/imports/ui/components/ToggleButton';

import {
  SliderWithInput,
  RangeWithInput,
} from '/imports/ui/components/SliderWithInput';

import SubComponentClass from './SubComponentClass';
import * as mapLayerRenderers from './dataset.mapLayerRenderers';
import * as mapLayerLegendRenderers from './dataset.mapLayerLegendRenderers';
import MapWithToolbar from './dataset.MapWithToolbar';

export default
class TabBaseClass extends SubComponentClass {
  // Override these.
  static tabIcon = null;
  static tabLabel = '';
  static tabStyle = {};
  static requiredProps = [];

  static defaultVariableOpacity = 0.5;

  constructor (...args) {
    super(...args);

    this._timeoutIds = {};
    this._intervalIds = {};
  }

  get isActiveTab () {
    return this.component.state.activeTab === this.name;
  }

  get isTabEnabled () {
    return this.constructor.requiredProps.every((key) => {
      return key in this.props && this.props[key];
    });
  }

  /**
   * @return {string}
   */
  get selectedVariableId () {
    return this.sharedState.selectedVariableId;
  }
  set selectedVariableId (value) {
    this.setSharedState({
      selectedVariableId: value,
    });
  }

  /**
   * @return {boolean}
   */
  get hasSelectedVariable () {
    return this.selectedVariableId !== '';
  }

  /**
   * @return {[Date, Date]}
   */
  get dateRangeTemporal () {
    return this.sharedState.dateRangeTemporal;
  }
  set dateRangeTemporal (value) {
    this.setSharedState({
      dateRangeTemporal: value,
    });
  }
  /**
   * Setting date range also updates current loaded date to make sure the
   * current loaded date is not outside of the date range.
   * @return {[Date, Date]}
   */
  get dateRange () {
    return this.sharedState.dateRange;
  }
  set dateRange (value) {
    let currentLoadedDate = this.currentLoadedDate;

    currentLoadedDate = clampDateWithinRange(currentLoadedDate, value[0], value[1]);

    this.setSharedState({
      dateRange: value,
      currentLoadedDate,
    });
  }
  /**
   * @return {Date}
   */
  get dateRangeStart () {
    return this.dateRange[0];
  }
  /**
   * @return {Date}
   */
  get dateRangeEnd () {
    return this.dateRange[1];
  }

  /**
   * @return {Date}
   */
  get currentLoadedDate () {
    return this.sharedState.currentLoadedDate;
  }
  set currentLoadedDate (value) {
    let preciseDate = this.getPreciseDateWithinTimespan(value);

    preciseDate = clampDateWithinRange(preciseDate, this.dateRangeStart, this.dateRangeEnd);

    if (preciseDate.valueOf() === this.currentLoadedDate.valueOf()) {
      return;
    }

    this.setSharedState({
      currentLoadedDate: preciseDate,
    });
  }

  /**
   * @return {Object}
   */
  get focusGeometry () {
    return this.sharedState.focusGeometry;
  }
  set focusGeometry (value) {
    this.setSharedState({
      focusGeometry: value,
    });
  }

  /**
   * Make sure the given date stays within the dataset timespan and has the proper resolution.
   * @param {Date} date
   * @returns {Date}
   */
  getPreciseDateWithinTimespan = (date) => {
    let preciseDate = getDateAtPrecision(date, this.component.temporalPrecision);

    if (preciseDate.valueOf() > this.component.timespan.period.lte.valueOf()) {
      preciseDate = this.component.timespan.period.lte;
    }

    if (preciseDate.valueOf() < this.component.timespan.period.gte.valueOf()) {
      preciseDate = this.component.timespan.period.gte;
    }

    return preciseDate;
  };

  /**
   * Returns true if the variable is selected.
   * @param {string} variableId
   * @returns {boolean}
   */
  isSelectedVariable (variableId) {
    return variableId === this.selectedVariableId;
  }

  getVariableNameById = (variableId) => {
    const variable = this.component.variables[variableId];

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
    return variableId in this.sharedState.variableOpacity
           ? this.sharedState.variableOpacity[variableId]
           : TabBaseClass.defaultVariableOpacity;
  }

  /**
   * @param {string} variableId
   * @param {number} opacity
   */
  setVariableOpacity (variableId, opacity) {
    this.setSharedState({
      variableOpacity: {
        [variableId]: opacity,
      },
    });
  }

  /**
   * @param {string} variableId
   * @returns {[Date, Date]|null}
   */
  getVariableStylingRange (variableId, defaultValue = null) {
    return variableId in this.sharedState.variableStylingRange
           ? this.sharedState.variableStylingRange[variableId]
           : defaultValue;
  }

  /**
   * @param {string} variableId
   * @param {[Date, Date]|null} range
   */
  setVariableStylingRange (variableId, range) {
    this.setSharedState({
      variableStylingRange: {
        [variableId]: range,
      },
    });
  }

  /**
   * @param {string} panelId
   * @returns {boolean}
   */
  isPanelOpen = (panelId, defaultState = true) => {
    return panelId in this.sharedState.isPanelOpen
           ? this.sharedState.isPanelOpen[panelId]
           // Open all panels by default.
           : defaultState;
  };

  /**
   * @param {string} panelId
   */
  togglePanelOpenState = (panelId, setTo = !this.isPanelOpen(panelId)) => {
    this.setSharedState({
      isPanelOpen: {
        [panelId]: setTo,
      },
    });
  };

  /**
   * @param {Date} date
   * @returns {number}
   */
  getSliderValueFromDate = (date) => this.component.getFrameIndexInTimespan(date);

  /**
   * @param {number} value
   * @return {Date}
   */
  getDateFromSliderValue = (value) => this.component.getDateFromFrameIndex(value);

  /**
   * @param {string} s
   * @return {Date}
   */
  getDateFromYearStringInput = (s) => {
    // Fill year string to 4 digits otherwise parsing will fail.
    const isBcYear = s[0] === '-';
    const absYearStr = isBcYear ? s.substr(1) : s;
    const zeroPadding = '0'.repeat(Math.max(4 - absYearStr.length, 0));
    const paddedAbsYearStr = zeroPadding + absYearStr;
    const paddedYearStr = isBcYear ? `-${paddedAbsYearStr}` : paddedAbsYearStr;

    const date = this.component.parsePreciseDateString(paddedYearStr);

    if (!date) {
      throw new Error('Invalid date.');
    }

    return date;
  };

  // Use these helpers to manage timers so they are properly canceled when the tab becomes inactive.

  /**
   * @param {Function} func
   * @param {number} delay
   * @param {Array<any>} params
   * @return {number}
   */
  setTimeout = (func, delay, ...params) => {
    const timeoutId = window.setTimeout(func, delay, ...params);
    const timeoutIdStr = String(timeoutId);

    this._timeoutIds[timeoutIdStr] = timeoutId;

    return timeoutId;
  };
  /**
   * @param {number} timeoutId
   */
  clearTimeout = (timeoutId) => {
    const timeoutIdStr = String(timeoutId);

    if (!(timeoutIdStr in this._timeoutIds)) {
      return;
    }

    window.clearTimeout(timeoutId);
    delete this._timeoutIds[timeoutIdStr];
  };
  /**
   * @param {Function} func
   * @param {number} delay
   * @param {Array<any>} params
   * @return {number}
   */
  setInterval = (func, delay, ...params) => {
    const intervalId = window.setInterval(func, delay, ...params);
    const intervalIdStr = String(intervalId);

    this._intervalIds[intervalIdStr] = intervalId;

    return intervalId;
  };
  /**
   * @param {number} intervalId
   */
  clearInterval = (intervalId) => {
    const intervalIdStr = String(intervalId);

    if (!(intervalIdStr in this._intervalIds)) {
      return;
    }

    window.clearInterval(intervalId);
    delete this._intervalIds[intervalIdStr];
  };

  /**
   * Called when this tab becomes active.
   */
  onActivate (/* event */) {
    // Override this.
  }

  /**
   * Called when this tab becomes inactive.
   */
  onDeactivate (/* event */) {
    Object.values(this._timeoutIds).forEach(this.clearTimeout);
    Object.values(this._intervalIds).forEach(this.clearInterval);

    // Override this.
  }

  /**
   * @param {Event} event
   * @param {[Date, Date]} dateRange
   */
  onChangeDateRange = (event, dateRange) => {
    const preciseDateRange = dateRange.map(this.getPreciseDateWithinTimespan);

    this.dateRangeTemporal = preciseDateRange;
  };

  /**
   * @param {Event} event
   * @param {[Date, Date]} dateRange
   */
  onFinishDateRange = (event, dateRange) => {
    const preciseDateRange = dateRange.map(this.getPreciseDateWithinTimespan);

    this.dateRange = preciseDateRange;
    this.dateRangeTemporal = preciseDateRange;
  };

  /**
   * Requires component as context object.
   * @param {Object} layer
   */
  renderMapLayer = (layer) => {
    if (!(layer.type in mapLayerRenderers)) {
      console.warn(`Unknown layer type “${layer.type}” for layer “${layer.name}”`);
      return null;
    }

    const renderer = mapLayerRenderers[layer.type];
    // @type {Date}
    const dateOfLayer = (typeof this.currentLoadedDate === 'undefined' || this.currentLoadedDate === null)
                        ? this.component.timespan.period.gte
                        : this.currentLoadedDate;

    return renderer.call(this, {
      ...layer,
      extent: this.component.extent,
      visible: this.isSelectedVariable(layer.name),
      opacity: this.getVariableOpacity(layer.name),
    }, {
      YYYY: () => moment(dateOfLayer).format('YYYY'),
      MM: () => moment(dateOfLayer).format('MM'),
      DD: () => moment(dateOfLayer).format('DD'),
    });
  };

  renderMapLayerLegend = (layer) => {
    if (!(layer.type in mapLayerLegendRenderers)) {
      console.warn(`Unknown layer type “${layer.type}” for layer “${layer.name}”`);
      return null;
    }

    const renderer = mapLayerLegendRenderers[layer.type];
    // @type {Date}
    const dateOfLayer = (typeof this.currentLoadedDate === 'undefined' || this.currentLoadedDate === null)
                        ? this.component.timespan.period.gte
                        : this.currentLoadedDate;

    return renderer.call(this, {
      ...layer,
    }, {
      YYYY: () => moment(dateOfLayer).format('YYYY'),
      MM: () => moment(dateOfLayer).format('MM'),
      DD: () => moment(dateOfLayer).format('DD'),
    });
  };

  renderMapLayerForSelectedVariable = (options = { legend: false }) => {
    const variableId = this.selectedVariableId;
    const layer = objectPath.get(this.component.variables, [variableId, 'overlay']);

    if (!layer) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderMapLayer(layer)}
        {options.legend && this.renderMapLayerLegend(layer)}
      </React.Fragment>
    );
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
        primaryText={label}
        primaryTogglesNestedList
        rightIconButton={(
          <ToggleButton
            label={isNestedItemsVisible ? 'Collapse' : 'Expand'}
            icon={isNestedItemsVisible ? <CollapseIcon /> : <ExpandIcon />}
            labelPosition="before"
            zDepthWhenToggled={0}
            toggled={isNestedItemsVisible}
            onToggle={toggleNestedItemsVisible}
            style={{
              color: 'rgba(0, 0, 0, 0.5)',
              top: '9px',
              width: false,
            }}
          />
        )}
        open={isNestedItemsVisible}
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
    const variableListItems = Object.entries(this.component.variables)
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
              onCheck={() => this.selectedVariableId = variableId}
            />
          )}
          primaryText={variable.name}
          style={{
            // This value should be 20px more than the width of the right icon button.
            paddingRight: '120px',
          }}
          rightIconButton={(
            <ToggleButton
              label="Style"
              icon={(
                <ImageStyleIcon />
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
    const timespan = this.component.timespan;
    const controls = [
      <ListItem
        disabled
        key="date-range"
        style={{
          padding: '0',
        }}
      >
        <RangeWithInput
          label="Date Range (year)"
          min={timespan.period.gte}
          max={timespan.period.lte}
          value={this.dateRangeTemporal}
          disabled={disabled}
          // (Date) => number
          toSliderValue={this.getSliderValueFromDate}
          // (number) => Date
          fromSliderValue={this.getDateFromSliderValue}
          // (Date) => string
          toInputValue={getYearStringFromDate}
          // (string) => Date
          fromInputValue={this.getDateFromYearStringInput}
          onChange={this.onChangeDateRange}
          onFinish={this.onFinishDateRange}
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
            min: getYearStringFromDate(timespan.period.gte),
            max: getYearStringFromDate(timespan.period.lte),
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
            boundaryGeometry={this.component.boundaryGeometry}
            focusGeometry={this.focusGeometry}
            updateFocusGeometry={(geom) => this.focusGeometry = geom}
          >
            {this.hasSelectedVariable && this.renderMapLayerForSelectedVariable()}
          </MapWithToolbar>
        </ListItem>
      </this.SidePanelCommonCollapsibleSectionContainer>
    );
  };

  // Override this.
  renderBody () {
    return null;
  }

  render () {
    return (
      <Tab
        className="tab-button"
        label={this.component.renderTabLabel({
          IconComponent: this.constructor.tabIcon,
          label: this.constructor.tabLabel,
        })}
        value={this.name}
        disabled={!this.isTabEnabled}
        style={{
          cursor: false,
          ...this.constructor.tabStyle,
        }}
      >{this.isTabEnabled && this.isActiveTab && this.renderBody()}</Tab>
    );
  }
}
