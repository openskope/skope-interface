import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  getClassName,
} from '/imports/ui/helpers';
import LayerListItem from './list-item';

export default class Component extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    layers: PropTypes.arrayOf(LayerListItem.propTypes.layer).isRequired,
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

  componentWillReceiveProps (nextProps) {
    const currentLayers = this.props.layers.map((layer) => _.pick(layer, ['id']));
    const nextLayers = nextProps.layers.map((layer) => _.pick(layer, ['id']));

    if (!_.isEqual(currentLayers, nextLayers)) {
      // Reset expand states.
      this.setState({
        itemExpandStatus: {},
      });
    }
  }

  onLayerItemExpandChange = (layerId, expanded) => this.setState({
    itemExpandStatus: {
      ...this.state.itemExpandStatus,
      [layerId]: expanded,
    },
  });

  getItemExpandState = (layerId) => this.state.itemExpandStatus[layerId];

  render () {
    const {
      className,
      itemClassName,
      layers,
      onChangeLayerVisibility,
      onChangeLayerOpacity,
    } = this.props;

    return (
      <div className={getClassName('layer-list', className)}>
        {layers.map((layer) => (
          <LayerListItem
            key={layer.id}
            className={getClassName('layer-list__item', itemClassName)}
            expanded={this.getItemExpandState(layer.id)}
            layer={layer}
            onItemExpandChange={(expanded) => this.onLayerItemExpandChange(layer.id, expanded)}
            onChangeLayerVisibility={(isVisible) => onChangeLayerVisibility(layer.id, isVisible)}
            onChangeLayerOpacity={(opacity) => onChangeLayerOpacity(layer.id, opacity)}
          />
        ))}
      </div>
    );
  }
}
