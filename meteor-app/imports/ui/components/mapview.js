import React from 'react';

export default class MapView extends React.Component {

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
      this.map.addEventListener('click:view', this._mapOnClick);
    }
  }

  _removeEventListeners () {
    if (this.map) {
      this.map.removeEventListener('click:view', this._mapOnClick);
    }
  }

  _mapOnClick = (event) => this.props.onClick && this.props.onClick(event)

  render () {
    const {
      className,
      children,
      ...custom
    } = this.props;

    // Remove props that should not appear on `map-view`.
    delete custom.onClick;

    return (
      <div
        className={className}
        style={{
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
