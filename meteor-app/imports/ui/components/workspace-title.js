import React from 'react';
import {
  connect,
} from 'react-redux';
import objectPath from 'object-path';

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
    title: objectPath.get(state, 'workspace.dataset.title', ''),
  }),
  // mapDispatchToProps
  null,
)(Component);
