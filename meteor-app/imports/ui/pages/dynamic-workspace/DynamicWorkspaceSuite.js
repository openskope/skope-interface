import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  connect,
} from 'react-redux';

import * as Suites from '/imports/ui/components/workspace-suites';
import { actions } from '/imports/ui/redux-store';
import { PropPrinter } from '/imports/ui/helpers';

class DynamicWorkspaceSuite extends React.PureComponent {
  static propTypes = {
    suiteType: PropTypes.string.isRequired,
    suiteProps: PropTypes.object,
    suiteState: PropTypes.object,
    setSuiteState: PropTypes.func,
  };

  static defaultProps = {
    suiteProps: {},
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
  (state, ownProps) => ({
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
