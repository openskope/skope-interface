/**
 * The purpose of this base class is to override the built-in React state
 * operations to make them, instead, operate on the global Redux store.
 *
 * This feature relies on the two props being passed in so the connection
 * to the Redux store is complete.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class SuiteBaseClass extends React.Component {

  static propTypes = {
    /**
     * The state stored in the dynamic suite state namespace.
     * This is passed in by the redux-connect.
     * @type {Object}
     */
    suiteState: PropTypes.object,
    /**
     * Function for updating the state stored in the dynamic suite state namespace.
     * This is passed in by the redux-connect.
     * @type {Function}
     */
    setSuiteState: PropTypes.func.isRequired,
  };

  static defaultProps = {
    suiteState: {},
  };

  static extendPropTypes (propTypes) {
    return {
      ...SuiteBaseClass.propTypes,
      ...propTypes,
    };
  }

  constructor (props) {
    super(props);

    this._inConstructor = true;
    this._backupState = null;
  }

  componentWillMount () {
    this._inConstructor = false;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.suiteState) {
      delete this._backupState;
    }
  }

  // Redirect all state operations to the dynamic suite namespace.
  get state () {
    // There will be a split-second when `this.props.suiteState` is not ready.
    // Use a backup source to make sure `render()` reads the proper states.
    return this._backupState || this.props.suiteState;
  }

  set state (state) {
    // Silently kill any set operations not in constructor.
    if (!this._inConstructor) {
      return;
    }

    this._backupState = { ...state };

    this.props.setSuiteState(state, {
      reset: true,
    });
  }

  setState = (state) => {
    if ('_backupState' in this) {
      this._backupState = {
        ...this._backupState,
        ...state,
      };
    }

    this.props.setSuiteState(state);
  };
}
