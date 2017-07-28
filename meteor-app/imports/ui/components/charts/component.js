import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import React from 'react';
import PropTypes from 'prop-types';
import ifvisible from 'ifvisible.js';

export default class Charts extends React.Component {
  static propTypes = {
    // Indicate if a point is selected for inspection.
    inspectPointSelected: PropTypes.bool.isRequired,
    // The coordinate of the point being inspected.
    inspectPointCoordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  /**
   * Helper function to minimize a window.
   * @param {Window} w
   */
  static _minimizeWindow (w) {
    // There's no way of truely minimizing the window.
    // The work-around here is to move it out of the screen.

    w._minimizeRestore = {
      width: w.outerWidth,
      height: w.outerHeight,
      x: w.screenX,
      y: w.screenY,
    };

    w.blur();
    w.resizeTo(0, 0);
    w.moveTo(screen.width, screen.height);
  }

  /**
   * Helper function to restore a minimized window.
   * @param {Window} w
   */
  static _restoreMinimizedWindow (w) {
    if (!w._minimizeRestore) {
      // Nothing we can do.
      return;
    }

    const {
      width,
      height,
      x,
      y,
    } = w._minimizeRestore;

    delete w._minimizeRestore;

    w.moveTo(x, y);
    w.resizeTo(width, height);
    w.focus();
  }

  constructor (props) {
    super(props);

    this.state = {
      inspectPointSelected: false,
      inspectPointCoordinate: [0, 0],
    };

    this._popUpWindow = null;

    this._bound_onWindowBlur = this._onWindowBlur.bind(this);
    this._bound_onWindowFocus = this._onWindowFocus.bind(this);
  }

  componentDidMount () {
    ifvisible.on('blur', this._bound_onWindowBlur);
    ifvisible.on('focus', this._bound_onWindowFocus);
  }

  componentWillReceiveProps (nextProps) {
    const {
      inspectPointSelected,
      inspectPointCoordinate,
    } = nextProps;

    this.setState({
      inspectPointSelected,
      inspectPointCoordinate,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    const {
      inspectPointSelected: nextSelected,
      inspectPointCoordinate: nextCoord,
    } = nextState;

    if (nextSelected) {
      // Open window if needed.
      this._openPopup(nextCoord);
    } else {
      // Close window if needed.
      this._closePopup();
    }

    return false;
  }

  componentWillUnmount () {
    ifvisible.off('blur', this._bound_onWindowBlur);
    ifvisible.off('focus', this._bound_onWindowFocus);

    this._closePopup();
  }

  _openPopup (coord) {
    const popUpUrl = FlowRouter.url('/workspace/charts', null, {
      longitude: coord[0],
      latitude: coord[1],
    });

    if (this._popUpWindow && !this._popUpWindow.closed) {
      this._popUpWindow.location.href = popUpUrl;
      this._popUpWindow.focus();
    } else {
      this._popUpWindow = window.open(popUpUrl, '_blank', 'height=600,width=800,menubar=no,status=no,titlebar=no');

      this._popUpWindow.onfocus = () => {
        this.constructor._restoreMinimizedWindow(this._popUpWindow);
      };
    }
  }

  _closePopup () {
    if (this._popUpWindow && !this._popUpWindow.closed) {
      this._popUpWindow.close();
    }
    this._popUpWindow = null;
  }

  _onWindowBlur () {
    // Minimize the child window when the parent window becomes inactive.
    if (this._popUpWindow && !this._popUpWindow.closed) {
      this.constructor._minimizeWindow(this._popUpWindow);
    }
  }

  _onWindowFocus () {
    // Restore the child window when the parent window becomes active.
    if (this._popUpWindow && !this._popUpWindow.closed) {
      this.constructor._restoreMinimizedWindow(this._popUpWindow);
    }
  }

  render () {
    return null;
  }
}
