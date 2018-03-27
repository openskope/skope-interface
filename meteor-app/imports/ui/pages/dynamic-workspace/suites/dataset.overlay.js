import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Paper from 'material-ui/Paper';
import {
  List,
  ListItem,
} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import {
  RadioButton,
} from 'material-ui/RadioButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import SliderWithInput from '/imports/ui/components/SliderWithInput';

import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';

import {
  DatasetMapIcon,
} from '/imports/ui/consts';

import {
  getDateAtPrecision,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabComponentClass from './TabComponentClass';

import * as mapLayerRenderers from './dataset.mapLayerRenderers';

export default
class OverlayTab extends TabComponentClass {

  static propTypes = {
    overlays: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      type: PropTypes.string,
      url: PropTypes.string,
      min: PropTypes.number,
      max: PropTypes.number,
      styles: PropTypes.arrayOf(PropTypes.string),
    })),
  };

  static defaultProps = {
    overlays: null,
  };

  static tabName = 'layers';
  static tabIcon = DatasetMapIcon;
  static tabLabel = 'Overlays';
  static requiredProps = [
    'overlays',
  ];

  static defaultLayerVisibility = false;
  static defaultLayerOpacity = 1;
  static paddingForSliders = {
    paddingLeft: '8px',
    paddingRight: '8px',
  };

  getInitialState () {
    return {
      // @type {Object<layerId: string, visible: boolean>}
      layerVisibility: {},
      // @type {Object<layerId: string, opacity: number>}
      layerOpacity: {},
      // @type {Date}
      currentLoadedDate: this.component.timespan.period.lte,
    };
  }

  /**
   * Returns true if the layer is visible.
   * @param {boolean} layerId
   * @returns {boolean}
   */
  isLayerVisible (layerId) {
    return layerId in this.state.layerVisibility
          ? this.state.layerVisibility[layerId]
          : OverlayTab.defaultLayerVisibility;
  }

  /**
   * @param {string} layerId
   * @param {number} isVisible
   */
  setLayerVisibility (layerId, isVisible) {
    this.setState({
      layerVisibility: {
        // ...this.state.layerVisibility, // Enable this line to allow multi-select.
        [layerId]: isVisible,
      },
    });
  }

  /**
   * @param {string} layerId
   */
  getLayerOpacity (layerId) {
    return layerId in this.state.layerOpacity
          ? this.state.layerOpacity[layerId]
          : OverlayTab.defaultLayerOpacity;
  }
  /**
   * @param {string} layerId
   * @param {number} opacity
   */
  setLayerOpacity (layerId, opacity) {
    this.setState({
      layerOpacity: {
        ...this.state.layerOpacity,
        [layerId]: opacity,
      },
    });
  }

  /**
   * Requires component as context object.
   * @param {Object} layer
   */
  renderMapLayer (layer) {
    if (!(layer.type in mapLayerRenderers)) {
      console.warn(`Unknown layer type “${layer.type}” for layer “${layer.name}”`);
      return null;
    }

    const mapLayerRenderer = mapLayerRenderers[layer.type];

    return mapLayerRenderer.call(this, {
      ...layer,
      extent: this.component.extent,
      visible: this.isLayerVisible(layer.name),
      opacity: this.getLayerOpacity(layer.name),
    }, {
      YYYY: () => moment(this.state.currentLoadedDate).format('YYYY'),
      MM: () => moment(this.state.currentLoadedDate).format('MM'),
      DD: () => moment(this.state.currentLoadedDate).format('DD'),
    });
  }

  loadedDateOnChange = (event, date) => {
    let preciseDate = getDateAtPrecision(date, this.component.temporalPrecision);

    if (preciseDate.valueOf() > this.component.timespan.period.lte.valueOf()) {
      preciseDate = this.component.timespan.period.lte;
    }

    if (preciseDate.valueOf() < this.component.timespan.period.gte.valueOf()) {
      preciseDate = this.component.timespan.period.gte;
    }

    if (preciseDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: preciseDate,
    });
  };

  renderBody () {
    const {
      /**
       * @type {Array<Object>}
       * @property {string} name
       * @property {string} description
       * @property {string} type
       * @property {string} url
       * @property {number} min
       * @property {number} max
       * @property {Array<string>} styles
       */
      overlays: layers,
    } = this.props;

    const timespan = this.component.timespan;

    const layerListItems = layers
    .map((layer) => ({
      name: layer.name,
      type: layer.type,
      url: layer.url,
      min: layer.min,
      max: layer.max,
      styles: layer.styles,
      invisible: !this.isLayerVisible(layer.name),
      opacity: this.getLayerOpacity(layer.name),
    }));

    const boundaryGeoJson = this.component.boundaryGeoJson;
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.component.extent;

    return (
      <div className="dataset__overlay-tab">
        <Paper
          className="overlay__controls"
          zDepth={1}
        >
          <List
            className="layer-list"
          >
            <Subheader>Variables with overlay</Subheader>
            {layerListItems.map((layerItem) => (
              <ListItem
                key={layerItem.name}
                className="layer-list__item"
                leftCheckbox={(
                  <RadioButton
                    value={layerItem.name}
                    checked={this.isLayerVisible(layerItem.name)}
                    onCheck={() => this.setLayerVisibility(layerItem.name, true)}
                  />
                )}
                primaryText={layerItem.name}
                nestedItems={[
                  <ListItem
                    key="layer-opacity"
                    disabled
                  >
                    <SliderWithInput
                      label="Opacity (%)"
                      min={0}
                      max={1}
                      step={0.01}
                      value={this.getLayerOpacity(layerItem.name)}
                      inputProps={{
                        type: 'number',
                        min: 0,
                        max: 100,
                      }}
                      toSliderValue={(v) => v * 100}
                      fromSliderValue={(v) => v / 100}
                      toInputValue={(v) => (v * 100).toFixed(0)}
                      fromInputValue={(v) => {
                        // We want to support both format `{N}%` and `{N}`.
                        let str = v;

                        if (str[str.length - 1] === '%') {
                          str = str.slice(0, -1);
                        }

                        if (isNaN(str)) {
                          throw new Error('Invalid number.');
                        }

                        return parseFloat(str) / 100;
                      }}
                      onChange={(event, newValue) => this.setLayerOpacity(layerItem.name, newValue)}
                      inputStyle={{
                        width: '60px',
                      }}
                    />
                  </ListItem>,
                  <ListItem
                    key="layer-style-range"
                    disabled
                    primaryText={(
                      <div className="adjustment-option__header">
                        <label>Overlay range: </label>
                      </div>
                    )}
                    secondaryText={(
                      <div
                        style={{
                          overflow: 'visible',
                          ...OverlayTab.paddingForSliders,
                        }}
                      >
                        <Range
                          className="input-slider--layer-opacity"
                          min={layerItem.min}
                          max={layerItem.max}
                          defaultValue={[
                            layerItem.min,
                            layerItem.max,
                          ]}
                        />
                      </div>
                    )}
                  />,
                  <ListItem
                    key="layer-style"
                    disabled
                    primaryText={(
                      <div className="adjustment-option__header">
                        <label>Overlay style: </label>
                      </div>
                    )}
                    secondaryText={(
                      <div
                        style={{
                          overflow: 'visible',
                        }}
                      >
                        <SelectField
                          value={0}
                          style={{
                            width: '100%',
                          }}
                        >{layerItem.styles.map((styleName, index) => (
                          <MenuItem
                            key={index}
                            value={index}
                            primaryText={styleName}
                          />
                        ))}</SelectField>
                      </div>
                    )}
                  />,
                ]}
              />
            ))}

            <Subheader>Temporal controls</Subheader>
            <ListItem
              disabled
            >
              <SliderWithInput
                label="Date (year)"
                min={timespan.period.gte}
                max={timespan.period.lte}
                value={this.state.currentLoadedDate}
                inputProps={{
                  type: 'number',
                  min: this.component.buildPreciseDateString(timespan.period.gte),
                  max: this.component.buildPreciseDateString(timespan.period.lte),
                }}
                // (Date) => number
                toSliderValue={(date) => moment.duration(date - timespan.period.gte).as(timespan.resolution)}
                // (number) => Date
                fromSliderValue={(v) => moment(timespan.period.gte).add(v, timespan.resolution).toDate()}
                // (Date) => string
                toInputValue={this.component.buildPreciseDateString}
                // (string) => Date
                fromInputValue={(s) => {
                  const date = this.component.parsePreciseDateString(s);

                  if (!date) {
                    throw new Error('Invalid date.');
                  }

                  return date;
                }}
                onChange={this.loadedDateOnChange}
                inputStyle={{
                  width: '60px',
                }}
              />
            </ListItem>
          </List>
        </Paper>

        <Paper
          className="overlay__map"
          zDepth={0}
        >
          <MapView
            basemap="arcgis"
            projection="EPSG:4326"
            extent={boundaryExtent}
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            {layerListItems.map((layer) => this.renderMapLayer(layer)).reverse()}
            {boundaryGeoJsonString && (
              <map-layer-geojson src-json={boundaryGeoJsonString} />
            )}
            <map-interaction-defaults />
            <map-control-defaults />
          </MapView>
        </Paper>
      </div>
    );
  }
}
