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
import EmailIcon from 'material-ui/svg-icons/communication/email';

import { actions } from '/imports/ui/redux-store';

import SafeLink from '/imports/ui/components/SafeLink';

import {
  demoRepository,
  version,
} from '/package.json';

import {
  contactEmail,
  userGuideUrl,
  appbarStyles,
  showBetaSign,
} from '/imports/ui/consts';

class Component extends React.Component {
  static propTypes = {
    title: PropTypes.any,
    children: PropTypes.any,
    currentRouterPath: PropTypes.string,
    navigateTo: PropTypes.func,
    onClickContactButton: PropTypes.func,
  };

  static defaultProps = {
    title: null,
    children: null,
    currentRouterPath: '',
    navigateTo: () => {},
    onClickContactButton: () => {},
  };

  renderTitle = () => (
    <div
      style={{
        color: appbarStyles.textColor,
      }}
    >
      <SafeLink
        href="https://www.openskope.org"
        text={(
          <span>
            <span>SKOPE</span>
            {showBetaSign && <span className="beta-ribbon">BETA</span>}
          </span>
        )}
        style={{
          color: appbarStyles.logoColor,
          fontFamily: "'Bitter', serif",
          fontSize: '1.3em',
          fontWeight: 'bold',
          marginLeft: showBetaSign ? 35 : 0,
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
          ><NoNotificationIcon color={appbarStyles.textColor} /></IconButton>
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
          ><AccountIcon color={appbarStyles.textColor} /></IconButton>
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

      <IconMenu
        iconButtonElement={
          <IconButton
            tooltip="Help"
            tooltipPosition="bottom-left"
          ><HelpIcon color={appbarStyles.textColor} /></IconButton>
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
        <MenuItem
          disabled={!userGuideUrl}
          insetChildren
          primaryText={userGuideUrl
          ? (
            <SafeLink
              href={userGuideUrl}
              text="User’s guide"
              noBadge
            />
          )
          : 'User’s guide'}
        />
        <Divider />
        <MenuItem
          leftIcon={<EmailIcon />}
          disabled={!contactEmail}
          onClick={this.props.onClickContactButton}
          primaryText="Contact"
        />
      </IconMenu>

      <IconMenu
        iconButtonElement={
          <IconButton
            tooltip="Boring Stuff"
            tooltipPosition="bottom-left"
          ><CodeIcon color={appbarStyles.textColor} /></IconButton>
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
          backgroundColor: appbarStyles.backgroundColor,
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
    onClickContactButton: () => {
      ((dealWithElement) => {
        const anchorElement = document.createElement('a');

        // Even though it's tested to be working when not inserted into document, just to be safe.
        anchorElement.style.display = 'none';
        document.body.appendChild(anchorElement);

        dealWithElement(anchorElement);

        document.body.removeChild(anchorElement);
      })((anchorElement) => {
        const subject = '';
        const body = `\n\n\n\n
Please do not modify the content below to help technical support.
--------------------------------------------------------------------------------
Version: ${version}
`;

        /**
         * TODO:
         * 1. Generate an incident ID with uuid.
         * 2. Send state info and incident ID to Sentry.
         * 3. Attach incident ID to email body (above).
         *
         * Probably don't need this anymore: ${btoa(encodeURIComponent(JSON.stringify(state)))}
         */

        anchorElement.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        anchorElement.click();
      });
    },
  }),
  // mapDispatchToProps
  (dispatch) => ({
    navigateTo: (url) => dispatch({
      type: actions.CHANGE_ROUTE.type,
      path: url,
    }),
  }),
)(Component);
