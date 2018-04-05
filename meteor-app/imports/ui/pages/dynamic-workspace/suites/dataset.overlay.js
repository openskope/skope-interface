// This is the "Map View".

import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import {
  List,
  ListItem,
} from 'material-ui/List';
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
} from '/imports/ui/components/SliderWithInput';

import {
  DatasetMapIcon,
} from '/imports/ui/consts';

import {
  offsetDateAtPrecision,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabComponentClass from './TabComponentClass';

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

  static defaultLayerOpacity = 1;
  static paddingForSliders = {
    paddingLeft: '8px',
    paddingRight: '8px',
  };

  /**
   * @return {boolean}
   */
  get isBackStepInTimeAllowed () {
    return this.state.currentLoadedDate > this.dateRangeStart;
  }

  /**
   * @return {boolean}
   */
  get isForwardStepInTimeAllowed () {
    return this.state.currentLoadedDate < this.dateRangeEnd;
  }

  getInitialState () {
    return {
      // @type {Object<layerId: string, opacity: number>}
      layerOpacity: {},
      // @type {Date}
      currentLoadedDate: this.component.timespan.period.gte,
      // @type {boolean}
      isPlaying: false,
      animationTimer: null,
    };
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
      currentLoadedDate: this.dateRangeStart,
    });
  }
  skipAnimationToEnd () {
    console.log('skipping animation to end');

    this.setState({
      currentLoadedDate: this.dateRangeEnd,
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

  onDeactivate (event) {
    super.onDeactivate(event);

    if (this.state.isPlaying) {
      this.stopAnimation();
    }
  }

  onChangeLoadedDate = (event, date) => {
    const preciseDate = this.getPreciseDateWithinTimespan(date);

    if (preciseDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: preciseDate,
    });
  };

  renderBody () {
    const boundaryGeoJson = this.component.boundaryGeoJson;
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const boundaryExtent = this.component.extent;

    return (
      <div className="dataset__overlay-tab">
        <Paper
          className="overlay__controls"
          zDepth={1}
        >
          <List>
            {this.renderVariableList()}
            {this.renderTemporalControls()}
          </List>
        </Paper>

        <Paper
          className="overlay__map"
          zDepth={0}
        >
          <MapView
            className="mapview"
            basemap="arcgis"
            projection="EPSG:4326"
            extent={boundaryExtent}
          >
            {this.hasSelectedVariable && this.renderMapLayerForSelectedVariable()}
            {boundaryGeoJsonString && (
              <map-layer-geojson src-json={boundaryGeoJsonString} />
            )}
            <map-interaction-defaults />
            <map-control-defaults />
          </MapView>

          <Toolbar
            style={{
              background: 'transparent',
            }}
          >
            <ToolbarGroup />

            <ToolbarGroup>
              <IconButton
                tooltip="To start"
                tooltipPosition="top-center"
                disabled={!this.hasSelectedVariable || !this.isBackStepInTimeAllowed}
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
                tooltipPosition="top-center"
                disabled={!this.hasSelectedVariable}
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
                tooltipPosition="top-center"
                disabled={!this.hasSelectedVariable || !this.isForwardStepInTimeAllowed}
                onClick={this.onClickToEndButton}
              >
                <ToEndIcon />
              </IconButton>
            </ToolbarGroup>

            <ToolbarGroup />
          </Toolbar>

          <SliderWithInput
            label="Date (year)"
            min={this.dateRangeStart}
            max={this.dateRangeEnd}
            value={this.state.currentLoadedDate}
            disabled={!this.hasSelectedVariable}
            // (Date) => number
            toSliderValue={this.getSliderValueFromDate}
            // (number) => Date
            fromSliderValue={this.getDateFromSliderValue}
            // (Date) => string
            toInputValue={this.getYearStringFromDate}
            // (string) => Date
            fromInputValue={this.getDateFromYearStringInput}
            onChange={this.onChangeLoadedDate}
            inputStyle={{
              width: '60px',
            }}
            sliderProps={{
              included: false,
            }}
            inputProps={{
              type: 'number',
              min: this.getYearStringFromDate(this.dateRangeStart),
              max: this.getYearStringFromDate(this.dateRangeEnd),
            }}
          />
        </Paper>
      </div>
    );
  }
}
