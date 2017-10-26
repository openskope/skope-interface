import React from 'react';
import {
  connect,
} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import ArrowRightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import HelpIcon from 'material-ui/svg-icons/action/help';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import NoNotificationIcon from 'material-ui/svg-icons/social/notifications-none';
import CodeIcon from 'material-ui/svg-icons/action/code';

// Import actions for the redux store.
import * as actions from '/imports/ui/actions';

import {
  demoRepository,
  version,
  appSettings,
} from '/package.json';

const APPBAR_BACKGROUNDCOLOR = '#f7f5e7';
const APPBAR_COLOR = 'black';

const Component = ({
  /**
   * @type {*}
   */
  title = null,
  /**
   * @type {*}
   */
  children = null,
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
  /**
   * Do whatever you want when the help button is clicked.
   * @type {Function}
   */
  onClickHelpButton,
}) => (
  <MuiThemeProvider muiTheme={customTheme}>
    <div className="appbar">
      <AppBar
        style={{
          backgroundColor: APPBAR_BACKGROUNDCOLOR,
        }}
        title={
          <div
            style={{
              color: APPBAR_COLOR,
            }}
          >
            <span style={{marginRight: 30}}>SKOPE</span>
            {title}
          </div>
        }
        iconElementLeft={
          <IconButton
            tooltip="Menu"
            onClick={onClickHamburgerButton}
          ><MenuIcon color={APPBAR_COLOR} /></IconButton>
        }
        iconElementRight={
          <span>
            <IconButton
              tooltip="Notifications"
            ><NoNotificationIcon color={APPBAR_COLOR} /></IconButton>

            <IconButton
              tooltip="Account"
            ><AccountIcon color={APPBAR_COLOR} /></IconButton>
            <IconButton
              tooltip="Help"
              onClick={onClickHelpButton}
            ><HelpIcon color={APPBAR_COLOR} /></IconButton>

            <IconMenu
              iconButtonElement={
                <IconButton
                  tooltip="Boring Stuff"
                  tooltipPosition="bottom-left"
                ><CodeIcon color={APPBAR_COLOR} /></IconButton>
              }
              targetOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
            >
              <MenuItem>
                <a href={demoRepository} target="_blank" rel="noopener noreferrer">{`ver ${version}`}</a>
              </MenuItem>
            </IconMenu>
          </span>
        }
      >{children}</AppBar>

      <Drawer
        docked={false}
        width={appSettings.drawerWidth}
        open={drawerIsOpen}
        onRequestChange={setDrawerOpenState}
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
  (state) => ({
    currentRouterPath: state.path,
    drawerIsOpen: state.drawer.isOpen,
  }),
  // mapDispatchToProps
  (dispatch) => ({
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
