import React from 'react';
import PropTypes from 'prop-types';

export class HorizontalResizer extends React.Component {

  static propTypes = {
    targetCurrentWidth: PropTypes.oneOfType([
      // The function is expected to return a number.
      PropTypes.func,
      PropTypes.number,
    ]).isRequired,
    targetMinWidth: PropTypes.oneOfType([
      // The function is expected to return a number.
      PropTypes.func,
      PropTypes.number,
    ]),
    targetMaxWidth: PropTypes.oneOfType([
      // The function is expected to return a number.
      PropTypes.func,
      PropTypes.number,
    ]),
    targetWidthOnChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    targetMinWidth: -1,
    targetMaxWidth: -1,
  };

  constructor (props) {
    super(props);

    this.state = {
      resizeData: {},
    };

    this._handleElement = null;
  }

  componentWillUnmount () {
    this.stopTracking();
  }

  onResizeHandleMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.startTracking(event);
  };

  onWindowMouseMove = (event) => {
    if (this.tracking) {
      const newWidth = this.getTrackedTargetWidth(event);

      this.updateTargetWidth(newWidth);
    }
  };

  onWindowMouseUp = (event) => {
    this.onWindowMouseMove(event);
    this.stopTracking();
  };

  get resizeData () {
    return this.state.resizeData;
  }

  get tracking () {
    return this.resizeData.tracking;
  }

  get handleWidth () {
    return this._handleElement
           ? this._handleElement.offsetWidth
           : 0;
  }

  get targetCurrentWidth () {
    return typeof this.props.targetCurrentWidth === 'function'
           ? this.props.targetCurrentWidth()
           : this.props.targetCurrentWidth;
  }

  get targetMinWidth () {
    return typeof this.props.targetMinWidth === 'function'
           ? this.props.targetMinWidth()
           : this.props.targetMinWidth;
  }

  get targetMaxWidth () {
    return typeof this.props.targetMaxWidth === 'function'
           ? this.props.targetMaxWidth()
           : this.props.targetMaxWidth;
  }

  getTrackedTargetWidth = (event) => {
    const {
      tracking,
      startCursorScreenX,
      startWidth,
      minWidth,
      minWidthSpecified,
      maxWidth,
      maxWidthSpecified,
    } = this.resizeData;

    if (tracking) {
      const cursorScreenXDelta = event.screenX - startCursorScreenX;
      let newWidth = startWidth + cursorScreenXDelta;

      if (maxWidthSpecified) {
        const maxWidthConsideringHandle = Math.max(maxWidth - this.handleWidth, 0);
        newWidth = Math.min(newWidth, maxWidthConsideringHandle);
      }

      if (minWidthSpecified) {
        newWidth = Math.max(newWidth, minWidth);
      }

      newWidth = Math.max(newWidth, 0);

      return newWidth;
    }

    return -1;
  };

  startTracking = (event) => {
    if (this.tracking) {
      return;
    }

    window.addEventListener('mousemove', this.onWindowMouseMove);
    window.addEventListener('mouseup', this.onWindowMouseUp);

    const startWidth = this.targetCurrentWidth;
    const startCursorScreenX = event.screenX;
    const minWidth = this.targetMinWidth;
    const maxWidth = this.targetMaxWidth;

    this.setState({
      resizeData: {
        startWidth,
        startCursorScreenX,
        minWidth,
        minWidthSpecified: minWidth !== -1,
        maxWidth,
        maxWidthSpecified: maxWidth !== -1,
        tracking: true,
      },
    });
  };

  stopTracking = () => {
    if (!this.tracking) {
      return;
    }

    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);

    this.setState({
      resizeData: {
        tracking: false,
      },
    });

    // Make sure all the other components are properly resized as well.
    window.dispatchEvent(new CustomEvent('resize'));
  };

  updateTargetWidth = (newWidth) => {
    this.props.targetWidthOnChange(newWidth);
  };

  render = () => (
    <div
      className="resize-handle--x"
      role="none"
      onMouseDown={this.onResizeHandleMouseDown}
      ref={(ref) => this._handleElement = ref}
    />
  );
}
