import React from 'react';
import PropTypes from 'prop-types';
import {
  getClassName,
} from '/imports/ui/helpers';
import LayerListItem from './list-item';

export default class Component extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    layers: PropTypes.array.isRequired,
    /**
     * Callback function for changing the visibility of layers.
     * @type {Function}
     */
    onChangeLayerVisibility: PropTypes.func,
    /**
     * Callback function for changing the opacity of layers.
     * @type {Function}
     */
    onChangeLayerOpacity: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    itemClassName: '',
    onChangeLayerVisibility: () => {},
    onChangeLayerOpacity: () => {},
  };

  constructor (props) {
    super(props);

    this.state = {
      itemExpandStatus: {},
    };
  }

  componentWillReceiveProps () {
    // Reset expand states.
    this.setState({
      itemExpandStatus: {},
    });
  }

  getItemExpandState = (layerId) => this.state.itemExpandStatus[layerId];

  onLayerItemExpandChange = (layerId, expanded) => this.setState({
    itemExpandStatus: {
      ...this.state.itemExpandStatus,
      [layerId]: expanded,
    },
  });

  render = ({
    className,
    itemClassName,
    layers,
    onChangeLayerVisibility,
    onChangeLayerOpacity,
  } = this.props) => (
    <div className={getClassName('layer-list', className)}>
      {layers.map((layer, layerIndex) => (
        <LayerListItem
          {...layer}
          key={layerIndex}
          className={getClassName('layer-list__item', itemClassName)}
          expanded={this.getItemExpandState(layerIndex)}
          onItemExpandChange={(expanded) => this.onLayerItemExpandChange(layerIndex, expanded)}
          onChangeLayerVisibility={(isVisible) => onChangeLayerVisibility(layerIndex, isVisible)}
          onChangeLayerOpacity={(opacity) => onChangeLayerOpacity(layerIndex, opacity)}
        />
      ))}
    </div>
  );
}
