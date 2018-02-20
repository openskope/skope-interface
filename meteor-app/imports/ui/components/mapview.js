import React from 'react';
import PropTypes from 'prop-types';

export default class MapView extends React.Component {

  static propTypes = {
    // Class name for the root element.
    className: PropTypes.string,
    // Style for the root element.
    style: PropTypes.object,
    // Children for the map view element.
    children: PropTypes.any,

    onViewLoad: PropTypes.func,
    onViewUnLoad: PropTypes.func,
    // (Event) => void
    onClick: PropTypes.func,
  };

  componentDidMount () {
    this._addEventListeners();
  }

  componentWillUpdate () {
    this._removeEventListeners();
  }

  componentDidUpdate () {
    this._addEventListeners();
  }

  componentWillUnmount () {
    this._removeEventListeners();
  }

  _addEventListeners () {
    if (this.map) {
      this.map.addEventListener('load:view', this._mapViewOnLoad);
      this.map.addEventListener('unload:view', this._mapViewOnUnLoad);
      this.map.addEventListener('click:view', this._mapOnClick);
    }
  }

  _removeEventListeners () {
    if (this.map) {
      this.map.removeEventListener('load:view', this._mapViewOnLoad);
      this.map.removeEventListener('unload:view', this._mapViewOnUnLoad);
      this.map.removeEventListener('click:view', this._mapOnClick);
    }
  }

  _mapViewOnLoad = (event) => this.props.onViewLoad && this.props.onViewLoad(event);
  _mapViewOnUnLoad = (event) => this.props.onViewUnLoad && this.props.onViewUnLoad(event);
  _mapOnClick = (event) => this.props.onClick && this.props.onClick(event);

  render () {
    const {
      className,
      style,
      children,
      ...custom
    } = this.props;

    // Remove props that should not appear on `map-view`.
    delete custom.onClick;
    delete custom.onViewLoad;
    delete custom.onViewUnLoad;

    return (
      <div
        className={className}
        style={{
          ...style,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <map-view
          {...custom}

          style={{
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 'auto',
            height: 'auto',
            border: 0,
          }}

          ref={(ref) => this.map = ref}
        >{children}</map-view>
      </div>
    );
  }
}
