import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

function difference(object, base) {
	function changes(object, base) {
		return _.transform(object, function(result, value, key) {
			if (!_.isEqual(value, base[key])) {
				result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
			}
		});
	}
	return changes(object, base);
}

export default class MapView extends React.PureComponent {

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

  static getRenderSensitiveProps = (props) => {
    const {
      onClick,
      onViewLoad,
      onViewUnLoad,
      ...sensitiveProps
    } = props;

    return sensitiveProps;
  };

  componentDidMount () {
    this._addEventListeners();
  }

  shouldComponentUpdate (nextProps) {
    const shouldRender = !_.isEqual(
      MapView.getRenderSensitiveProps(this.props),
      MapView.getRenderSensitiveProps(nextProps),
    );

    if (shouldRender) {
      console.log('difference', difference(this.props, nextProps));
    }

    return shouldRender;
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
    } = MapView.getRenderSensitiveProps(this.props);

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
