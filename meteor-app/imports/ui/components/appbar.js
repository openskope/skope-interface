import React from 'react';
import {
  connect,
} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import ArrowRightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

// Import actions for the redux store.
import * as actions from '/imports/ui/actions';

import {
  appSettings,
} from '/package.json';

const Component = ({
  /**
   * @type {String}
   */
  currentRouterPath = '',
  /**
   * @type {Boolean}
   */
  drawerIsOpen = false,
  /**
   * @type {Function}
   */
  onClickHamburgerButton,
  /**
   * @type {Function}
   */
  setDrawerOpenState,
  /**
   * @type {Function}
   */
  navigateTo,
}) => (
  <MuiThemeProvider>
    <div className="appbar">
      <AppBar
        title="SKOPE"
        onLeftIconButtonTouchTap={onClickHamburgerButton}
        iconElementRight={
          <FlatButton label="Stuff on the right side" onClick={() => alert('Clicked!')} />
        }
      />
      <Drawer
        docked={false}
        width={appSettings.drawerWidth}
        open={drawerIsOpen}
        onRequestChange={(open) => setDrawerOpenState(open)}
      >
        {appSettings.drawerItems.map(({
          title,
          url,
        }) => (
          <MenuItem
            key={title}
            onClick={() => navigateTo(url)}
            leftIcon={currentRouterPath === url ? <ArrowRightIcon /> : null}
          >{title}</MenuItem>
        ))}
      </Drawer>
    </div>
  </MuiThemeProvider>
);

export default connect(
  // mapStateToProps
  (state, ownProps) => ({
    currentRouterPath: state.path,
    drawerIsOpen: state.drawer.isOpen,
  }),
  // mapDispatchToProps
  (dispatch, ownProps) => ({
    onClickHamburgerButton: () => dispatch({
      type: actions.OPEN_DRAWER.type,
    }),
    setDrawerOpenState: (isOpen) => dispatch({
      type: actions.OPEN_DRAWER.type,
      overrideWith: isOpen,
    }),
    navigateTo: (url) => dispatch({
      type: actions.CHANGE_ROUTE.type,
      path: url,
    }),
  }),
)(Component);
