import React from 'react';
import {
  connect,
} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import {
  Card,
  CardHeader,
  CardText,
} from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import Slider from 'material-ui/Slider';

// Import actions for the redux store.
import * as actions from '/imports/ui/actions';

import {
  getClassName,
} from '/imports/ui/helpers';

const Component = ({
  className = '',
  layers = [],
  /**
   * Callback function for changing the visibility of layers.
   * @type {Function}
   */
  onChangeLayerVisibility,
  /**
   * Callback function for changing the opacity of layers.
   * @type {Function}
   */
  onChangeLayerOpacity,
}) => (
  <MuiThemeProvider muiTheme={customTheme}>
    <div className={getClassName('layer-list', className)}>
      {layers.map((layer, layerIndex) => (
        <Card
          key={layerIndex}
          className="layer-list__item"
        >
          <CardHeader
            title={
              <Checkbox
                label={layer.name}
                checked={!layer.invisible}
                onCheck={(event, isInputChecked) => onChangeLayerVisibility(layerIndex, isInputChecked)}
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
                min={0}
                max={255}
                value={layer.opacity * 255}
                onChange={(event, newValue) => onChangeLayerOpacity(layerIndex, newValue / 255)}
                sliderStyle={{
                  marginTop: 0,
                  marginBottom: 0,
                }}
              />
              <label>{layer.opacity.toFixed(2)}</label>
            </div>
          </CardText>
        </Card>
      ))}
    </div>
  </MuiThemeProvider>
);

export default connect(
  // mapStateToProps
  null,
  // mapDispatchToProps
  (dispatch) => ({
    onChangeLayerVisibility: (layerIndex, visible) => dispatch({
      type: actions.WORKSPACE_TOGGLE_LAYER_VISIBILITY.type,
      index: layerIndex,
      visible,
    }),
    onChangeLayerOpacity: (layerIndex, opacity) => dispatch({
      type: actions.WORKSPACE_CHANGE_LAYER_OPACITY.type,
      index: layerIndex,
      opacity,
    }),
  }),
)(Component);
