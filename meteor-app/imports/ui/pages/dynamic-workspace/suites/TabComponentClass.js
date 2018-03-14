/* eslint class-methods-use-this: off */

import React from 'react';
import {
  Tab,
} from 'material-ui/Tabs';

import SubComponentClass from './SubComponentClass';

export default
class TabComponentClass extends SubComponentClass {
  // Override these.
  static tabName = '';
  static tabIcon = null;
  static tabLabel = '';
  static requiredProps = [];

  get isActiveTab () {
    return this.component.state.activeTab === this.constructor.tabName;
  }

  get isTabEnabled () {
    return this.constructor.requiredProps.every((key) => {
      return key in this.props && this.props[key];
    });
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
        value={this.constructor.tabName}
        disabled={!this.isTabEnabled}
        style={{
          cursor: false,
        }}
      >{this.isTabEnabled && this.isActiveTab && this.renderBody()}</Tab>
    );
  }
}
