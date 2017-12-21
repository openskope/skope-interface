import React from 'react';
import {
  connect,
} from 'react-redux';

const Component = ({
  /**
   * @type {*}
   */
  title = null,
}) => (
  <span>{title}</span>
);

export default connect(
  // mapStateToProps
  (state) => ({
    title: (state.workspace.configData && state.workspace.configData.title) || '',
  }),
  // mapDispatchToProps
  null,
)(Component);
