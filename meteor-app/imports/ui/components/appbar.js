import React from 'react';
import PropTypes from 'prop-types';
import {
  connect,
} from 'react-redux';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import HelpIcon from 'material-ui/svg-icons/action/help';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import NoNotificationIcon from 'material-ui/svg-icons/social/notifications-none';
import CodeIcon from 'material-ui/svg-icons/action/code';

import { actions } from '/imports/ui/redux-store';

import SafeLink from '/imports/ui/components/SafeLink';

import {
  demoRepository,
  version,
  appSettings,
} from '/package.json';

class Component extends React.Component {
  static propTypes = {
    title: PropTypes.any,
    children: PropTypes.any,
    currentRouterPath: PropTypes.string,
    navigateTo: PropTypes.func,
    onClickHelpButton: PropTypes.func,
  };

  static defaultProps = {
    title: null,
    children: null,
    currentRouterPath: '',
    navigateTo: () => {},
    onClickHelpButton: () => {},
  };

  renderTitle = () => (
    <div
      style={{
        color: appSettings.appBarTextColor,
      }}
    >
      <SafeLink
        href="https://www.openskope.org"
        text="SKOPE"
        style={{
          color: 'currentColor',
          marginRight: 30,
        }}
        noBadge
      />
      {this.props.title}
    </div>
  );

  renderToolbar = () => (
    <span>
      <IconMenu
        iconButtonElement={
          <IconButton
            tooltip="Notifications"
          ><NoNotificationIcon color={appSettings.appBarTextColor} /></IconButton>
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
        <MenuItem>You are all caught up</MenuItem>
      </IconMenu>

      <IconMenu
        iconButtonElement={
          <IconButton
            tooltip="Account"
          ><AccountIcon color={appSettings.appBarTextColor} /></IconButton>
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
      ><HelpIcon color={appSettings.appBarTextColor} /></IconButton>

      <IconMenu
        iconButtonElement={
          <IconButton
            tooltip="Boring Stuff"
            tooltipPosition="bottom-left"
          ><CodeIcon color={appSettings.appBarTextColor} /></IconButton>
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
          backgroundColor: appSettings.appBarBackgroundColor,
        }}
        title={this.renderTitle()}
        showMenuIconButton={false}
        iconElementRight={this.renderToolbar()}
      >{this.props.children}</AppBar>
    </div>
  );
}

export default connect(
  // mapStateToProps
  (state) => ({
    currentRouterPath: state.path,
  }),
  // mapDispatchToProps
  (dispatch) => ({
    navigateTo: (url) => dispatch({
      type: actions.CHANGE_ROUTE.type,
      path: url,
    }),
  }),
)(Component);
