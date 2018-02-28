import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Tab,
} from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import DatePicker from 'material-ui/DatePicker';
import IconButton from 'material-ui/IconButton';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import {
  List,
  ListItem,
} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Checkbox from 'material-ui/Checkbox';
import Slider from 'material-ui/Slider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';

import {
  DatasetMapIcon,
} from '/imports/ui/consts';

import {
  getDateAtPrecision,
  offsetDateAtPrecision,
  getPrecisionByResolution,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import SubComponentClass from './SubComponentClass';

import * as mapLayerRenderers from './dataset.mapLayerRenderers';

export default
class OverlayTab extends SubComponentClass {

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

  static defaultLayerVisibility = false;
  static defaultLayerOpacity = 1;
  static opacitySliderMin = 0;
  static opacitySliderMax = 255;
  static paddingForSliders = {
    paddingLeft: '8px',
    paddingRight: '8px',
  };

  static getDisplayTextForLayerOpacity = (opacity) => opacity.toFixed(2);

  getInitialState () {
    const timespan = this.component.timespan;

    return {
      // @type {Object.<layerId: string, visible: boolean>}
      layerVisibility: {},
      // @type {Object.<layerId: string, opacity: number>}
      layerOpacity: {},
      // @type {string}
      timespanResolution: timespan.resolution,
      // @type {{gte: Date, lte: Date}}
      timespanPeriod: timespan.period,
      // @type {Date}
      currentLoadedDate: timespan.period.lte,
    };
  }

  /**
   * Returns true if the layer is visible.
   * @param {boolean} layerId
   * @returns {boolean}
   */
  getLayerVisibility (layerId) {
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
   * @param {string} layerId
   */
  getOpacitySliderValueForLayer (layerId) {
    const opacity = this.getLayerOpacity(layerId);
    const sliderValue = (opacity * (OverlayTab.opacitySliderMax - OverlayTab.opacitySliderMin)) + OverlayTab.opacitySliderMin;

    return sliderValue;
  }
  /**
   * Requires component as context object.
   * @param {string} layerId
   * @param {number} value
   */
  setLayerOpacityFromSliderValue (layerId, value) {
    const opacity = (value - OverlayTab.opacitySliderMin) / (OverlayTab.opacitySliderMax - OverlayTab.opacitySliderMin);

    this.setLayerOpacity(layerId, opacity);
  }

  /**
   * Requires component as context object.
   * @param {Object} layer
   */
  renderMapLayer (layer) {
    if (!(layer.type in mapLayerRenderers)) {
      console.warn(`Unknown layer type “${layer.type}” for layer “${layer.id}”`);
      return null;
    }

    const mapLayerRenderer = mapLayerRenderers[layer.type];

    return mapLayerRenderer.call(this, {
      ...layer,
      extent: this.component.getDatasetExtent(),
      visible: this.getLayerVisibility(layer.id),
      opacity: this.getLayerOpacity(layer.id),
    }, {
      YYYY: () => moment(this.state.currentLoadedDate).format('YYYY'),
      MM: () => moment(this.state.currentLoadedDate).format('MM'),
      DD: () => moment(this.state.currentLoadedDate).format('DD'),
    });
  }

  isBackStepInTimeAllowed = () => {
    return this.state.currentLoadedDate > this.state.timespanPeriod.gte;
  };

  isForwardStepInTimeAllowed = () => {
    return this.state.currentLoadedDate < this.state.timespanPeriod.lte;
  };

  offsetCurrentTimeAtPrecisionByAmount = (amount) => {
    if (!amount) {
      return;
    }

    const datePrecision = getPrecisionByResolution(this.state.timespanResolution);
    let newLoadedDate = offsetDateAtPrecision(this.state.currentLoadedDate, datePrecision, amount);

    if (newLoadedDate.valueOf() > this.state.timespanPeriod.lte.valueOf()) {
      newLoadedDate = this.state.timespanPeriod.lte;
    }

    if (newLoadedDate.valueOf() < this.state.timespanPeriod.gte.valueOf()) {
      newLoadedDate = this.state.timespanPeriod.gte;
    }

    if (newLoadedDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: newLoadedDate,
    });
  };

  timeStepBackButtonOnClick = (/* event */) => {
    this.offsetCurrentTimeAtPrecisionByAmount(-1);
  };

  timeStepForwardButtonOnClick = (/* event */) => {
    this.offsetCurrentTimeAtPrecisionByAmount(1);
  };

  loadedDateOnChange = (event, date) => {
    const datePrecision = getPrecisionByResolution(this.state.timespanResolution);
    let preciseDate = getDateAtPrecision(date, datePrecision);

    if (preciseDate.valueOf() > this.state.timespanPeriod.lte.valueOf()) {
      preciseDate = this.state.timespanPeriod.lte;
    }

    if (preciseDate.valueOf() < this.state.timespanPeriod.gte.valueOf()) {
      preciseDate = this.state.timespanPeriod.gte;
    }

    if (preciseDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: preciseDate,
    });
  };

  render () {
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

    if (!layers) {
      return null;
    }

    const layerListItems = layers
    // Add `id` property to the layers if not present.
    .map((layer, index) => ({
      id: index,
      ...layer,
    }))
    .map((layer) => ({
      id: layer.id,
      title: layer.name,
      type: layer.type,
      url: layer.url,
      min: layer.min,
      max: layer.max,
      styles: layer.styles,
      invisible: !this.getLayerVisibility(layer.id),
      opacity: this.getLayerOpacity(layer.id),
    }));

    const toolbarTooltipPosition = 'top-center';

    const boundaryGeoJson = this.component.getDatasetBoundaryGeoJson();
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.component.getDatasetExtent();

    return (
      <Tab
        label={this.component.renderTabLabel({
          IconComponent: DatasetMapIcon,
          label: 'Overlays',
        })}
        value="layers"
      >
        <div className="dataset__overlay-tab">
          <Paper
            className="overlay__controls"
            zDepth={1}
          >
            <List
              className="layer-list"
            >
              <Subheader>Layers</Subheader>
              {layerListItems.map((layerItem) => (
                <ListItem
                  key={layerItem.id}
                  className="layer-list__item"
                  leftCheckbox={(
                    <Checkbox
                      checked={this.getLayerVisibility(layerItem.id)}
                      onCheck={(event, isChecked) => this.setLayerVisibility(layerItem.id, isChecked)}
                    />
                  )}
                  primaryText={layerItem.title}
                  nestedItems={[
                    <ListItem
                      key="layer-opacity"
                      disabled
                      primaryText={(
                        <div className="adjustment-option__header">
                          <label>Opacity: </label>
                          <label>{OverlayTab.getDisplayTextForLayerOpacity(this.getLayerOpacity(layerItem.id))}</label>
                        </div>
                      )}
                      secondaryText={(
                        <div
                          style={{
                            overflow: 'visible',
                            ...OverlayTab.paddingForSliders,
                          }}
                        >
                          <Slider
                            className="input-slider--layer-opacity"
                            min={OverlayTab.opacitySliderMin}
                            max={OverlayTab.opacitySliderMax}
                            value={this.getOpacitySliderValueForLayer(layerItem.id)}
                            onChange={(event, newValue) => this.setLayerOpacityFromSliderValue(layerItem.id, newValue)}
                            sliderStyle={{
                              marginTop: 0,
                              marginBottom: 0,
                            }}
                          />
                        </div>
                      )}
                    />,
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
            </List>

            <Toolbar
              style={{
                height: 48,
              }}
            >
              <ToolbarGroup>
                <ToolbarTitle text="Time" />

                <DatePicker
                  openToYearSelection
                  hintText="Controlled Date Input"
                  minDate={this.state.timespanPeriod.gte}
                  maxDate={this.state.timespanPeriod.lte}
                  value={this.state.currentLoadedDate}
                  formatDate={this.component.buildPreciseDateString}
                  onChange={this.loadedDateOnChange}
                  textFieldStyle={{
                    width: '85px',
                  }}
                />

                <IconButton
                  tooltip="Step back"
                  tooltipPosition={toolbarTooltipPosition}
                  disabled={!this.isBackStepInTimeAllowed()}
                  onClick={this.timeStepBackButtonOnClick}
                >
                  <LeftArrowIcon />
                </IconButton>

                <IconButton
                  tooltip="Step forward"
                  tooltipPosition={toolbarTooltipPosition}
                  disabled={!this.isForwardStepInTimeAllowed()}
                  onClick={this.timeStepForwardButtonOnClick}
                >
                  <RightArrowIcon />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </Paper>

          <Paper
            className="overlay__map"
            zDepth={0}
          >
            <MapView
              basemap="osm"
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
      </Tab>
    );
  }
}
