import React from 'react';
import {
  connect,
} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from 'material-ui/Toolbar';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import ArrowRightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import HelpIcon from 'material-ui/svg-icons/action/help';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import NotificationIcon from 'material-ui/svg-icons/social/notifications';
import NoNotificationIcon from 'material-ui/svg-icons/social/notifications-none';

// Import actions for the redux store.
import * as actions from '/imports/ui/actions';

import {
  demoRepository,
  version,
  appSettings,
} from '/package.json';

const Component = ({
  //!
}) => (
  <MuiThemeProvider>
    <Toolbar>
      <ToolbarGroup firstChild={true} />
      <ToolbarGroup lastChild={true}>
        <FlatButton label={`ver ${version}`} href={demoRepository} target="_blank" rel="noopener noreferrer" />
      </ToolbarGroup>
    </Toolbar>
  </MuiThemeProvider>
);

export default connect(
  // mapStateToProps
  (state, ownProps) => ({
    //!
  }),
  // mapDispatchToProps
  (dispatch, ownProps) => ({
    //!
  }),
)(Component);
