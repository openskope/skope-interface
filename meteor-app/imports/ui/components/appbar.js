import React from 'react';
import PropTypes from 'prop-types';
import {
  connect,
} from 'react-redux';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import ArrowRightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import HelpIcon from 'material-ui/svg-icons/action/help';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import NoNotificationIcon from 'material-ui/svg-icons/social/notifications-none';
import CodeIcon from 'material-ui/svg-icons/action/code';

import { actions } from '/imports/ui/redux-store';

import {
  demoRepository,
  version,
  appSettings,
} from '/package.json';

const APPBAR_BACKGROUNDCOLOR = '#f7f5e7';
const APPBAR_COLOR = 'black';

class Component extends React.Component {
  static propTypes = {
    title: PropTypes.any,
    children: PropTypes.any,
    currentRouterPath: PropTypes.string,
    drawerIsOpen: PropTypes.bool,
    onClickHamburgerButton: PropTypes.func,
    setDrawerOpenState: PropTypes.func,
    navigateTo: PropTypes.func,
    onClickHelpButton: PropTypes.func,
  };

  static defaultProps = {
    title: null,
    children: null,
    currentRouterPath: '',
    drawerIsOpen: false,
    onClickHamburgerButton: () => {},
    setDrawerOpenState: () => {},
    navigateTo: () => {},
    onClickHelpButton: () => {},
  };

  renderTitle = () => (
    <div
      style={{
        color: APPBAR_COLOR,
      }}
    >
      <span style={{ marginRight: 30 }}>SKOPE</span>
      {this.props.title}
    </div>
  );

  renderLeftIcon = () => (
    <IconButton
      tooltip="Menu"
      onClick={this.props.onClickHamburgerButton}
    ><MenuIcon color={APPBAR_COLOR} /></IconButton>
  );

  renderToolbar = () => (
    <span>
      <IconButton
        tooltip="Notifications"
      ><NoNotificationIcon color={APPBAR_COLOR} /></IconButton>

      <IconMenu
        iconButtonElement={
          <IconButton
            tooltip="Account"
          ><AccountIcon color={APPBAR_COLOR} /></IconButton>
        }
        targetOrigin={{
          horizontal: 'middle',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: 'middle',
          vertical: 'bottom',
        }}
      >
        <MenuItem disabled>Log in</MenuItem>
        <Divider />
        <MenuItem disabled>Sign up</MenuItem>
      </IconMenu>

      <IconButton
        tooltip="Help"
        onClick={this.props.onClickHelpButton}
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
  );

  render = () => (
    <div className="appbar">
      <AppBar
        style={{
          backgroundColor: APPBAR_BACKGROUNDCOLOR,
        }}
        title={this.renderTitle()}
        iconElementLeft={this.renderLeftIcon()}
        iconElementRight={this.renderToolbar()}
      >{this.props.children}</AppBar>

      <Drawer
        docked={false}
        width={appSettings.drawerWidth}
        open={this.props.drawerIsOpen}
        onRequestChange={this.props.setDrawerOpenState}
      >
        {appSettings.drawerItems.map((item) => (
          <MenuItem
            key={item.title}
            onClick={() => this.props.navigateTo(item.url)}
            leftIcon={this.props.currentRouterPath === item.url ? <ArrowRightIcon /> : null}
          >{item.title}</MenuItem>
        ))}
      </Drawer>
    </div>
  );
}

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
