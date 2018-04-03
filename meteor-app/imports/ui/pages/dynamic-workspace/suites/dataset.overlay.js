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
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import ToStartIcon from 'material-ui/svg-icons/av/skip-previous';
import ToEndIcon from 'material-ui/svg-icons/av/skip-next';
import {
  SliderWithInput,
  RangeWithInput,
} from '/imports/ui/components/SliderWithInput';

import {
  DatasetMapIcon,
} from '/imports/ui/consts';

import {
  getDateAtPrecision,
  offsetDateAtPrecision,
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

  static tabIcon = DatasetMapIcon;
  static tabLabel = 'Map View';
  static requiredProps = [
    'overlays',
  ];

  static defaultLayerVisibility = false;
  static defaultLayerOpacity = 1;
  static paddingForSliders = {
    paddingLeft: '8px',
    paddingRight: '8px',
  };

  /**
   * @return {boolean}
   */
  get hasVisibleLayer () {
    return Object.keys(this.state.layerVisibility).length > 0;
  }

  /**
   * @return {*}
   */
  get animationRangeStart () {
    return this.state.animationRange[0];
  }
  /**
   * @return {*}
   */
  get animationRangeEnd () {
    return this.state.animationRange[1];
  }

  /**
   * @return {boolean}
   */
  get isBackStepInTimeAllowed () {
    return this.state.currentLoadedDate > this.animationRangeStart;
  }

  /**
   * @return {boolean}
   */
  get isForwardStepInTimeAllowed () {
    return this.state.currentLoadedDate < this.animationRangeEnd;
  }

  getInitialState () {
    return {
      // @type {Object<layerId: string, visible: boolean>}
      layerVisibility: {},
      // @type {Object<layerId: string, opacity: number>}
      layerOpacity: {},
      // @type {Date}
      currentLoadedDate: this.component.timespan.period.gte,
      // @type {boolean}
      isPlaying: false,
      animationTimer: null,
      animationRange: [
        this.component.timespan.period.gte,
        this.component.timespan.period.lte,
      ],
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

  onNextAnimationFrame = () => {
    console.log('onNextAnimationFrame');

    if (this.isForwardStepInTimeAllowed) {
      this.offsetCurrentTimeAtPrecisionByAmount(1);
    } else {
      this.stopAnimation();
    }
  };

  startAnimation () {
    const animationTimer = this.setInterval(this.onNextAnimationFrame, 1000);

    this.setState({
      isPlaying: true,
      animationTimer,
    });
  }
  stopAnimation () {
    this.clearInterval(this.state.animationTimer);
    this.setState({
      isPlaying: false,
      animationTimer: null,
    });
  }

  skipAnimationToStart () {
    console.log('skipping animation to start');

    this.setState({
      currentLoadedDate: this.animationRangeStart,
    });
  }
  skipAnimationToEnd () {
    console.log('skipping animation to end');

    this.setState({
      currentLoadedDate: this.animationRangeEnd,
    });
  }

  onClickPlayButton = () => {
    if (this.state.isPlaying) {
      this.stopAnimation();
    } else {
      if (!this.isForwardStepInTimeAllowed) {
        this.skipAnimationToStart();
      }
      this.startAnimation();
    }
  };

  onClickToStartButton = () => {
    this.skipAnimationToStart();
  };

  onClickToEndButton = () => {
    this.skipAnimationToEnd();
  };

  offsetCurrentTimeAtPrecisionByAmount = (amount) => {
    if (!amount) {
      return;
    }

    let newLoadedDate = offsetDateAtPrecision(this.state.currentLoadedDate, this.component.temporalPrecision, amount);

    if (newLoadedDate.valueOf() > this.component.timespan.period.lte.valueOf()) {
      newLoadedDate = this.component.timespan.period.lte;
    }

    if (newLoadedDate.valueOf() < this.component.timespan.period.gte.valueOf()) {
      newLoadedDate = this.component.timespan.period.gte;
    }

    if (newLoadedDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: newLoadedDate,
    });
  };

  getPreciseDateWithinTimespan = (date) => {
    let preciseDate = getDateAtPrecision(date, this.component.temporalPrecision);

    if (preciseDate.valueOf() > this.component.timespan.period.lte.valueOf()) {
      preciseDate = this.component.timespan.period.lte;
    }

    if (preciseDate.valueOf() < this.component.timespan.period.gte.valueOf()) {
      preciseDate = this.component.timespan.period.gte;
    }

    return preciseDate;
  };

  /**
   * @param {Date} date
   * @return {number}
   */
  getSliderValueFromDate = (date) => {
    const timespan = this.component.timespan;
    const sliderRawValue = moment.duration(date - timespan.period.gte).as(timespan.resolution);

    return Math.floor(sliderRawValue);
  };

  /**
   * @param {number} value
   * @return {Date}
   */
  getDateFromSliderValue = (value) => {
    const timespan = this.component.timespan;

    return moment(timespan.period.gte).add(value, timespan.resolution).toDate();
  };

  /**
   * @param {Date} date
   * @return {string}
   */
  getYearStringFromDate = (date) => {
    return this.component.buildPreciseDateString(date);
  };

  /**
   * @param {string} s
   * @return {Date}
   */
  getDateFromYearStringInput = (s) => {
    // Fill year string to 4 digits otherwise parsing will fail.
    const isBcYear = s[0] === '-';
    const absYearStr = isBcYear ? s.substr(1) : s;
    const zeroPadding = '0'.repeat(Math.max(4 - absYearStr.length, 0));
    const paddedAbsYearStr = zeroPadding + absYearStr;
    const paddedYearStr = isBcYear ? `-${paddedAbsYearStr}` : paddedAbsYearStr;

    const date = this.component.parsePreciseDateString(paddedYearStr);

    if (!date) {
      throw new Error('Invalid date.');
    }

    return date;
  };

  loadedDateOnChange = (event, date) => {
    const preciseDate = this.getPreciseDateWithinTimespan(date);

    if (preciseDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: preciseDate,
    });
  };

  onChangeAnimationRange = (event, dateRange) => {
    const preciseDateRange = dateRange.map(this.getPreciseDateWithinTimespan);

    if (
      preciseDateRange[0].valueOf() === this.animationRangeStart.valueOf()
   && preciseDateRange[1].valueOf() === this.animationRangeEnd.valueOf()
    ) {
      return;
    }

    this.setState({
      animationRange: preciseDateRange,
    });
  };

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
                      sliderProps={{
                        included: false,
                      }}
                      inputProps={{
                        type: 'number',
                        min: 0,
                        max: 100,
                      }}
                    />
                  </ListItem>,
                  <ListItem
                    key="layer-style-range"
                    disabled
                  >
                    <RangeWithInput
                      disabled
                      label="Range of variable values displayed on color ramp"
                      min={layerItem.min}
                      max={layerItem.max}
                      step={1}
                      value={[layerItem.min, layerItem.max]}
                      onChange={() => {}}
                      inputStyle={{
                        width: '60px',
                      }}
                      inputProps={{
                        type: 'number',
                        min: layerItem.min,
                        max: layerItem.max,
                      }}
                    />
                  </ListItem>,
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
                          disabled
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
              style={{
                paddingTop: '0',
                paddingRight: '16px',
                paddingLeft: '16px',
                paddingBottom: '22px',
              }}
            >
              <RangeWithInput
                label="Date Range (year)"
                min={timespan.period.gte}
                max={timespan.period.lte}
                value={this.state.animationRange}
                disabled={!this.hasVisibleLayer || this.state.isPlaying}
                // (Date) => number
                toSliderValue={this.getSliderValueFromDate}
                // (number) => Date
                fromSliderValue={this.getDateFromSliderValue}
                // (Date) => string
                toInputValue={this.getYearStringFromDate}
                // (string) => Date
                fromInputValue={this.getDateFromYearStringInput}
                onChange={this.onChangeAnimationRange}
                inputStyle={{
                  width: '60px',
                }}
                inputProps={{
                  type: 'number',
                  min: this.getYearStringFromDate(timespan.period.gte),
                  max: this.getYearStringFromDate(timespan.period.lte),
                }}
              />
            </ListItem>
            <ListItem
              disabled
              style={{
                paddingTop: '0',
                paddingRight: '16px',
                paddingLeft: '16px',
                paddingBottom: '0',
              }}
            >
              <Toolbar
                style={{
                  background: 'transparent',
                }}
              >
                <ToolbarGroup />

                <ToolbarGroup>
                  <IconButton
                    tooltip="To start"
                    disabled={!this.hasVisibleLayer || !this.isBackStepInTimeAllowed}
                    onClick={this.onClickToStartButton}
                  >
                    <ToStartIcon />
                  </IconButton>
                  <ToolbarSeparator
                    style={{
                      marginLeft: '10px',
                      marginRight: '10px',
                    }}
                  />
                  <IconButton
                    tooltip="Play/pause"
                    disabled={!this.hasVisibleLayer}
                    onClick={this.onClickPlayButton}
                  >
                    {this.state.isPlaying
                    ? (
                      <PauseIcon />
                    )
                    : (
                      <PlayIcon />
                    )}
                  </IconButton>
                  <ToolbarSeparator
                    style={{
                      marginLeft: '10px',
                      marginRight: '10px',
                    }}
                  />
                  <IconButton
                    tooltip="To end"
                    disabled={!this.hasVisibleLayer || !this.isForwardStepInTimeAllowed}
                    onClick={this.onClickToEndButton}
                  >
                    <ToEndIcon />
                  </IconButton>
                </ToolbarGroup>

                <ToolbarGroup />
              </Toolbar>
            </ListItem>
            <ListItem
              disabled
              style={{
                paddingTop: '0',
                paddingRight: '16px',
                paddingLeft: '16px',
                paddingBottom: '22px',
              }}
            >
              <SliderWithInput
                label="Date (year)"
                min={this.animationRangeStart}
                max={this.animationRangeEnd}
                value={this.state.currentLoadedDate}
                disabled={!this.hasVisibleLayer}
                // (Date) => number
                toSliderValue={this.getSliderValueFromDate}
                // (number) => Date
                fromSliderValue={this.getDateFromSliderValue}
                // (Date) => string
                toInputValue={this.getYearStringFromDate}
                // (string) => Date
                fromInputValue={this.getDateFromYearStringInput}
                onChange={this.loadedDateOnChange}
                inputStyle={{
                  width: '60px',
                }}
                sliderProps={{
                  included: false,
                }}
                inputProps={{
                  type: 'number',
                  min: this.getYearStringFromDate(this.animationRangeStart),
                  max: this.getYearStringFromDate(this.animationRangeEnd),
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
