import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  connect,
} from 'react-redux';

import { actions } from '/imports/ui/redux-store';
import { PropPrinter } from '/imports/ui/helpers';

import * as Suites from './suites';

class DynamicWorkspaceSuite extends React.PureComponent {
  static propTypes = {
    // Routing info from state.
    routing: PropTypes.object.isRequired,
    // Suite type determines the renderer to use.
    suiteType: PropTypes.string.isRequired,
    // Props passed to the suite renderer.
    suiteProps: PropTypes.object,
    // State passed to the suite renderer.
    suiteState: PropTypes.object,
    // Callback when the suite needs to set state.
    setSuiteState: PropTypes.func,
  };

  static defaultProps = {
    suiteProps: {},
    suiteState: {},
    setSuiteState: () => {},
  };

  shouldComponentUpdate (nextProps) {
    let shouldUpdate = false;

    if (this.props.suiteType !== nextProps.suiteType) {
      shouldUpdate = true;
    }

    if (!_.isEqual(this.props.suiteProps, nextProps.suiteProps)) {
      shouldUpdate = true;
    }

    if (!_.isEqual(this.props.suiteState, nextProps.suiteState)) {
      shouldUpdate = true;
    }

    return shouldUpdate;
  }

  render () {
    if (this.props.suiteType in Suites) {
      const WorkspaceSuite = Suites[this.props.suiteType];
      return (
        <WorkspaceSuite
          {...this.props.suiteProps}
          routing={this.props.routing}
          suiteState={this.props.suiteState}
          setSuiteState={this.props.setSuiteState}
        />
      );
    }

    return (
      <div>
        <h1>Invalid Suite Type</h1>
        <PropPrinter
          {...{
            suiteType: this.props.suiteType,
            suiteProps: this.props.suiteProps,
          }}
        />
      </div>
    );
  }
}

export default connect(
  // mapStateToProps
  (state) => ({
    routing: state.routing,
    suiteState: state.workspace.DynamicSuiteNS,
  }),
  // mapDispatchToProps
  (dispatch) => ({
    setSuiteState: (state, options = {}) => dispatch({
      type: actions.WORKSPACE_SET_SUITE_STATE.type,
      state,
      options,
    }),
  }),
)(DynamicWorkspaceSuite);
