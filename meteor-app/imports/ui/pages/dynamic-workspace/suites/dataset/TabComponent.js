/**
 * Base class for a tab.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default
class TabComponent extends React.Component {
  static propTypes = {
    workspace: PropTypes.object.isRequired,
  };

  /**
   * Fundamental properties of the tab.
   * Override these.
   */
  /**
   * Name of the tab. Used for identifying the tab in the code.
   * @type {string}
   */
  static tabName = '';
  /**
   * Optional icon component. If specified, the icon will be rendered in the tab button.
   * @type {React.Component}
   */
  static tabIcon = null;
  /**
   * Displayed content in the tab button.
   * @type {React.ReactNode}
   */
  static tabLabel = null;
  /**
   * Style for the tab button.
   * @type {Object}
   */
  static tabStyle = {};
  /**
   * List of props that are required for the tab to be enabled.
   * @type {Array.<string>}
   */
  static requiredProps = [];

  get name () {
    return this.constructor.tabName;
  }

  get workspace () {
    return this.props.workspace;
  }
}
