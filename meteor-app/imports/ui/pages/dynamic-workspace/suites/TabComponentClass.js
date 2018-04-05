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

import {
  getDateAtPrecision,
} from '/imports/ui/helpers';

import {
  RangeWithInput,
} from '/imports/ui/components/SliderWithInput';

import SubComponentClass from './SubComponentClass';

import * as mapLayerRenderers from './dataset.mapLayerRenderers';

export default
class TabComponentClass extends SubComponentClass {
  // Override these.
  static tabIcon = null;
  static tabLabel = '';
  static tabStyle = {};
  static requiredProps = [];

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

  /**
   * @return {boolean}
   */
  get hasSelectedVariable () {
    return this.sharedState.selectedVariableId !== '';
  }

  /**
   * @return {Date}
   */
  get dateRangeStart () {
    return this.sharedState.dateRange[0];
  }
  /**
   * @return {Date}
   */
  get dateRangeEnd () {
    return this.sharedState.dateRange[1];
  }
  /**
   * @return {[Date, Date]}
   */
  get dateRange () {
    return this.sharedState.dateRange;
  }

  get mapToolbarStyles () {
    const {
      muiTheme,
    } = this.props;

    return {
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
  }

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
    return variableId === this.sharedState.selectedVariableId;
  }

  /**
   * @param {string} variableId
   */
  setSelectedVariableId (variableId) {
    this.setSharedState({
      selectedVariableId: variableId,
    });
  }

  isPanelOpen (panelId) {
    return panelId in this.sharedState.isPanelOpen
           ? this.sharedState.isPanelOpen[panelId]
           // Open all panels by default.
           : true;
  }

  togglePanelOpenState (panelId) {
    const panelOpenState = this.sharedState.isPanelOpen;

    this.setSharedState({
      isPanelOpen: {
        ...panelOpenState,
        [panelId]: !this.isPanelOpen(panelId),
      },
    });
  }

  /**
   * @param {Date} date
   * @return {number}
   */
  getFrameIndexInTimespan = (date) => {
    const timespan = this.component.timespan;
    const sliderRawValue = moment.duration(date - timespan.period.gte).as(timespan.resolution);

    return Math.floor(sliderRawValue);
  };

  getSliderValueFromDate = (date) => this.getFrameIndexInTimespan(date);

  /**
   * @param {number} value
   * @return {Date}
   */
  getDateFromSliderValue = (value) => {
    const timespan = this.component.timespan;

    return moment(timespan.period.gte).add(value, timespan.resolution).toDate();
  };

  /**
   * @param {Date} date
   * @return {string}
   */
  getYearStringFromDate = (date) => {
    return this.component.buildPreciseDateString(date);
  };

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
  onActivate (event) {
    // Override this.
  }

  /**
   * Called when this tab becomes inactive.
   */
  onDeactivate (event) {
    Object.values(this._timeoutIds).forEach(this.clearTimeout);
    Object.values(this._intervalIds).forEach(this.clearInterval);

    // Override this.
  }

  onChangeDateRange = (event, dateRange) => {
    const preciseDateRange = dateRange.map(this.getPreciseDateWithinTimespan);

    if (
      preciseDateRange[0].valueOf() === this.dateRangeStart.valueOf()
   && preciseDateRange[1].valueOf() === this.dateRangeEnd.valueOf()
    ) {
      return;
    }

    this.setSharedState({
      dateRange: preciseDateRange,
    });
  };

  /**
   * Requires component as context object.
   * @param {Object} layer
   */
  renderMapLayer (layer) {
    if (!(layer.type in mapLayerRenderers)) {
      console.warn(`Unknown layer type “${layer.type}” for layer “${layer.name}”`);
      return null;
    }

    const mapLayerRenderer = mapLayerRenderers[layer.type];
    // @type {Date}
    const dateOfLayer = (typeof this.state.currentLoadedDate === 'undefined' || this.state.currentLoadedDate === null)
                        ? this.component.timespan.period.lte
                        : this.state.currentLoadedDate;

    return mapLayerRenderer.call(this, {
      ...layer,
      extent: this.component.extent,
      visible: this.isSelectedVariable(layer.name),
      // opacity: this.getLayerOpacity(layer.name),
      opacity: 0.7,
    }, {
      YYYY: () => moment(dateOfLayer).format('YYYY'),
      MM: () => moment(dateOfLayer).format('MM'),
      DD: () => moment(dateOfLayer).format('DD'),
    });
  }

  renderMapLayerForSelectedVariable () {
    const variableId = this.sharedState.selectedVariableId;
    const layer = objectPath.get(this.component.variables, [variableId, 'overlay']);

    if (!layer) {
      return null;
    }

    return this.renderMapLayer(layer);
  }

  renderVariableList () {
    const variableListItems = Object.entries(this.component.variables)
    .map(([variableId, variable]) => (
      <ListItem
        key={`variable-list-item__${variableId}`}
        className="layer-list__item"
        leftCheckbox={(
          <RadioButton
            value={variableId}
            checked={this.isSelectedVariable(variableId)}
            onCheck={() => this.setSelectedVariableId(variableId)}
          />
        )}
        primaryText={variable.name}
      />
    ));

    return (
      <ListItem
        key="variable-list"
        primaryText="Select variable to display"
        primaryTogglesNestedList
        open={this.isPanelOpen('variable-list')}
        onNestedListToggle={() => this.togglePanelOpenState('variable-list')}
        nestedItems={variableListItems}
      />
    );
  }

  renderTemporalControls () {
    const timespan = this.component.timespan;

    return (
      <ListItem
        key="temporal-controls"
        primaryText="Temporal controls"
        primaryTogglesNestedList
        open={this.isPanelOpen('temporal-controls')}
        onNestedListToggle={() => this.togglePanelOpenState('temporal-controls')}
        nestedItems={[
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
              value={this.dateRange}
              disabled={!this.hasSelectedVariable || this.state.isPlaying}
              // (Date) => number
              toSliderValue={this.getSliderValueFromDate}
              // (number) => Date
              fromSliderValue={this.getDateFromSliderValue}
              // (Date) => string
              toInputValue={this.getYearStringFromDate}
              // (string) => Date
              fromInputValue={this.getDateFromYearStringInput}
              onChange={this.onChangeDateRange}
              inputStyle={{
                width: '60px',
              }}
              inputProps={{
                type: 'number',
                min: this.getYearStringFromDate(timespan.period.gte),
                max: this.getYearStringFromDate(timespan.period.lte),
              }}
            />
          </ListItem>,
        ]}
      />
    );
  }

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
