import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardText,
} from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import Slider from 'material-ui/Slider';

export default class LayerItem extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    expanded: PropTypes.bool,
    layer: PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      title: PropTypes.string,
      invisible: PropTypes.bool,
      opacity: PropTypes.number,
    }).isRequired,
    onItemExpandChange: PropTypes.func,
    /**
     * Callback function for changing the visibility of this layer.
     * @type {(a: bool) => *}
     */
    onChangeLayerVisibility: PropTypes.func,
    /**
     * Callback function for changing the opacity of this layer.
     * @type {(a: number) => *}
     */
    onChangeLayerOpacity: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    expanded: false,
    onItemExpandChange: () => {},
    onChangeLayerVisibility: () => {},
    onChangeLayerOpacity: () => {},
  };

  static opacitySliderMin = 0;
  static opacitySliderMax = 255;

  static getSliderValueFromOpacity = (opacity) => (opacity * (LayerItem.opacitySliderMax - LayerItem.opacitySliderMin)) + LayerItem.opacitySliderMin;
  static getOpacityFromSliderValue = (value) => (value - LayerItem.opacitySliderMin) / (LayerItem.opacitySliderMax - LayerItem.opacitySliderMin);
  static getDisplayTextForOpacity = (opacity) => opacity.toFixed(2);

  render () {
    const {
      className,
      expanded,
      layer: {
        title = '',
        invisible = false,
        opacity = 1,
      },
      onItemExpandChange,
      onChangeLayerVisibility,
      onChangeLayerOpacity,
    } = this.props;

    return (
      <Card
        className={className}
        expanded={expanded}
        onExpandChange={onItemExpandChange}
      >
        <CardHeader
          title={
            <Checkbox
              label={title}
              checked={!invisible}
              onCheck={(event, isInputChecked) => onChangeLayerVisibility(isInputChecked)}
              style={{
                whiteSpace: 'nowrap',
              }}
            />
          }
          showExpandableButton
        />
        <CardText
          expandable
        >
          <div className="layer-opacity-row">
            <label>Opacity: </label>
            <Slider
              className="input-slider--layer-opacity"
              min={LayerItem.opacitySliderMin}
              max={LayerItem.opacitySliderMax}
              value={LayerItem.getSliderValueFromOpacity(opacity)}
              onChange={(event, newValue) => onChangeLayerOpacity(LayerItem.getOpacityFromSliderValue(newValue))}
              sliderStyle={{
                marginTop: 0,
                marginBottom: 0,
              }}
            />
            <label>{LayerItem.getDisplayTextForOpacity(opacity)}</label>
          </div>
        </CardText>
      </Card>
    );
  }
}
