/* eslint class-methods-use-this: off */

import React from 'react';
import {
  Tab,
} from 'material-ui/Tabs';

import SubComponentClass from './SubComponentClass';

export default
class TabComponentClass extends SubComponentClass {
  // Override these.
  static tabIcon = null;
  static tabLabel = '';
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
        }}
      >{this.isTabEnabled && this.isActiveTab && this.renderBody()}</Tab>
    );
  }
}
