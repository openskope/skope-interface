// This is the "Map View".
/* global HTMLMapLayerVector */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
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
import FlatButton from 'material-ui/FlatButton';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import ToStartIcon from 'material-ui/svg-icons/av/skip-previous';
import ToEndIcon from 'material-ui/svg-icons/av/skip-next';
import {
  SliderWithInput,
} from '/imports/ui/components/SliderWithInput';

import {
  DatasetMapIcon,
  PanToolIcon,
  BoxToolIcon,
  presentationProjection,
  maxMapZoomLevel,
  minMapZoomLevel,
  dataSpatialBoundaryFillColor,
} from '/imports/ui/consts';

import {
  getYearStringFromDate,
  offsetDateAtPrecision,
  buildGeoJsonWithGeometry,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabBaseClass from '../BaseClass';

class OverlayTabContent extends React.Component {

  static propTypes = {
    // Some data.
    hasSelectedVariable: PropTypes.bool.isRequired,
    currentLoadedDate: PropTypes.instanceOf(Date).isRequired,
    dateRangeStart: PropTypes.instanceOf(Date).isRequired,
    dateRangeEnd: PropTypes.instanceOf(Date).isRequired,
    boundaryGeometry: PropTypes.object.isRequired,
    focusGeometry: PropTypes.object,

    // Some helper functions.
    getSliderValueFromDate: PropTypes.func.isRequired,
    getDateFromSliderValue: PropTypes.func.isRequired,
    getDateFromYearStringInput: PropTypes.func.isRequired,
    renderVariableList: PropTypes.func.isRequired,
    renderTemporalControls: PropTypes.func.isRequired,
    renderFocusBoundaryMap: PropTypes.func.isRequired,
    renderMapLayerForSelectedVariable: PropTypes.func.isRequired,
    updateFocusGeometry: PropTypes.func.isRequired,
    updateLoadedDate: PropTypes.func.isRequired,
    offsetCurrentTimeAtPrecisionByAmount: PropTypes.func.isRequired,
    isPanelOpen: PropTypes.func.isRequired,
    togglePanelOpenState: PropTypes.func.isRequired,
  };

  static defaultProps = {
    focusGeometry: null,
  };

  static selectionTools = [
    {
      name: 'pan',
      IconClass: PanToolIcon,
      title: 'Pan tool',
    },
    {
      name: 'rectangle',
      IconClass: BoxToolIcon,
      title: 'Rectangle tool',
      drawingType: 'Box',
      freehandDrawing: true,
    },
  ];

  constructor (props) {
    super(props);

    this._detailMap = null;

    this.state = {
      // Copy of the date for the sliders.
      currentLoadedDateTemporal: props.currentLoadedDate,
      // @type {boolean}
      isPlaying: false,
      animationTimer: null,
    };
  }

  componentDidMount () {
    this.connectOverviewMap();
  }

  componentWillReceiveProps (nextProps) {
    const updates = {};

    if (nextProps.currentLoadedDate.valueOf() !== this.state.currentLoadedDateTemporal.valueOf()) {
      updates.currentLoadedDateTemporal = nextProps.currentLoadedDate;
    }

    this.setState(updates);
  }

  componentWillUnmount () {
    this.disconnectOverviewMap();

    if (this.isPlaying) {
      this.stopAnimation();
    }
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

  onNextAnimationFrame = () => {
    console.log('onNextAnimationFrame');

    if (this.isForwardStepInTimeAllowed) {
      this.props.offsetCurrentTimeAtPrecisionByAmount(1);
    } else {
      this.stopAnimation();
    }
  };

  get isPlaying () {
    return this.state.isPlaying;
  }

  /**
   * @return {boolean}
   */
  get isBackStepInTimeAllowed () {
    return this.props.currentLoadedDate > this.props.dateRangeStart;
  }
  /**
   * @return {boolean}
   */
  get isForwardStepInTimeAllowed () {
    return this.props.currentLoadedDate < this.props.dateRangeEnd;
  }

  connectOverviewMap () {
    if (!(this._detailMap && this._detailMap.map)) {
      return;
    }

    //! Workaround to set max zoom without `web-gis-components` supporting it.
    this._detailMap.map.olMap_.getView().setMaxZoom(maxMapZoomLevel);
    this._detailMap.map.olMap_.getView().setMinZoom(minMapZoomLevel);
  }

  disconnectOverviewMap () {
    if (!(this._detailMap && this._detailMap.map)) {
      return;
    }

    //! Nothing for now.
  }

  startAnimation () {
    this.setState({
      isPlaying: true,
      animationTimer: setInterval(this.onNextAnimationFrame, 1000),
    });
  }
  stopAnimation () {
    clearInterval(this.state.animationTimer);
    this.setState({
      isPlaying: false,
      animationTimer: null,
    });
  }

  skipAnimationToStart () {
    console.log('skipping animation to start');

    this.props.updateLoadedDate(this.props.dateRangeStart);
  }
  skipAnimationToEnd () {
    console.log('skipping animation to end');

    this.props.updateLoadedDate(this.props.dateRangeEnd);
  }

  renderAnimationControls () {
    const {
      hasSelectedVariable,
    } = this.props;

    return (
      <Toolbar
        style={{
          background: 'transparent',
          height: '48px',
        }}
      >
        <ToolbarGroup />

        <ToolbarGroup>
          <FlatButton
            label="To start"
            icon={<ToStartIcon />}
            disabled={!hasSelectedVariable || !this.isBackStepInTimeAllowed}
            onClick={this.onClickToStartButton}
            style={{
              margin: false,
            }}
          />
          <ToolbarSeparator
            style={{
              marginLeft: '10px',
              marginRight: '10px',
            }}
          />
          <FlatButton
            label={this.isPlaying ? 'Pause' : 'Play'}
            icon={this.isPlaying ? <PauseIcon /> : <PlayIcon />}
            disabled={!hasSelectedVariable}
            onClick={this.onClickPlayButton}
            style={{
              width: '6.5em',
              margin: false,
            }}
          />
          <ToolbarSeparator
            style={{
              marginLeft: '10px',
              marginRight: '10px',
            }}
          />
          <FlatButton
            label="To end"
            icon={<ToEndIcon />}
            disabled={!hasSelectedVariable || !this.isForwardStepInTimeAllowed}
            onClick={this.onClickToEndButton}
            style={{
              margin: false,
            }}
          />
        </ToolbarGroup>

        <ToolbarGroup />
      </Toolbar>
    );
  }

  renderTimeline () {
    const {
      hasSelectedVariable,
      dateRangeStart,
      dateRangeEnd,
      getSliderValueFromDate,
      getDateFromSliderValue,
      getDateFromYearStringInput,
      updateLoadedDate,
    } = this.props;
    const {
      currentLoadedDateTemporal,
    } = this.state;

    return (
      <SliderWithInput
        label="Date (year):"
        min={dateRangeStart}
        max={dateRangeEnd}
        value={currentLoadedDateTemporal}
        disabled={!hasSelectedVariable}
        // (Date) => number
        toSliderValue={getSliderValueFromDate}
        // (number) => Date
        fromSliderValue={getDateFromSliderValue}
        // (Date) => string
        toInputValue={getYearStringFromDate}
        // (string) => Date
        fromInputValue={getDateFromYearStringInput}
        onChange={(event, date) => this.setState({ currentLoadedDateTemporal: date })}
        onFinish={(event, date) => updateLoadedDate(date)}
        style={{
          // This is a workaround to insert cells used only for spacing into the grid to achieve the desired effect.
          gridTemplateAreas: '"spacing-left label spacing-inBetween input spacing-right" "slider slider slider slider slider"',
          gridAutoColumns: '1fr auto 1em auto 1fr',
        }}
        inputStyle={{
          width: '60px',
        }}
        sliderProps={{
          included: false,
          handleStyle: [
            {
              transform: 'scale(1.4)',
            },
          ],
        }}
        inputProps={{
          type: 'number',
          min: getYearStringFromDate(dateRangeStart),
          max: getYearStringFromDate(dateRangeEnd),
        }}
      />
    );
  }

  render () {
    const {
      hasSelectedVariable,
      boundaryGeometry,
      focusGeometry,
      renderVariableList,
      renderTemporalControls,
      renderFocusBoundaryMap,
      renderMapLayerForSelectedVariable,
      isPanelOpen,
      togglePanelOpenState,
    } = this.props;

    const focusBoundaryGeoJson = buildGeoJsonWithGeometry(focusGeometry);
    const focusBoundaryGeoJsonString = focusBoundaryGeoJson && JSON.stringify(focusBoundaryGeoJson);
    const finalFocusGeometry = focusGeometry || boundaryGeometry;
    const focusExtent = finalFocusGeometry && HTMLMapLayerVector.getExtentFromGeometry(finalFocusGeometry, HTMLMapLayerVector.IOProjection);

    return (
      <div className="dataset__overlay-tab">
        <Paper
          className="overlay__controls"
          zDepth={1}
        >
          <List>
            {renderVariableList({})}
            {renderTemporalControls({
              disabled: this.isPlaying,
            })}
            {renderFocusBoundaryMap({
              selectionTools: OverlayTabContent.selectionTools,
            })}
          </List>
        </Paper>

        <Paper
          className="overlay__map"
          zDepth={0}
        >
          <MapView
            className="mapview"
            basemap="arcgis"
            projection={presentationProjection}
            extent={focusExtent}
            ref={(ref) => this._detailMap = ref}
          >
            {hasSelectedVariable && renderMapLayerForSelectedVariable({ legend: true })}
            {focusBoundaryGeoJsonString && (
              <map-layer-geojson
                style={{
                  // Do not use any fill so the variable overlay is not affected.
                  fill: 'none',
                }}
                src-json={focusBoundaryGeoJsonString}
              />
            )}
            <map-interaction-defaults />
            <map-control-defaults />
          </MapView>

          <List>
            <ListItem
              key="overlay-animation"
              primaryText="Animation"
              primaryTogglesNestedList
              open={isPanelOpen('overlay-animation')}
              onNestedListToggle={() => togglePanelOpenState('overlay-animation')}
              nestedItems={[
                <ListItem
                  disabled
                  key="animation-controls"
                  style={{
                    padding: '0',
                  }}
                >{this.renderAnimationControls()}</ListItem>,
                <ListItem
                  disabled
                  key="animation-timeline"
                  style={{
                    padding: '0',
                  }}
                >{this.renderTimeline()}</ListItem>,
              ]}
            />
          </List>
        </Paper>
      </div>
    );
  }
}

export default
class OverlayTab extends TabBaseClass {

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

  renderBody () {
    return (
      <OverlayTabContent
        // Some data.
        hasSelectedVariable={this.hasSelectedVariable}
        currentLoadedDate={this.currentLoadedDate}
        dateRangeStart={this.dateRangeStart}
        dateRangeEnd={this.dateRangeEnd}
        boundaryGeometry={this.component.boundaryGeometry}
        focusGeometry={this.focusGeometry}

        // Some helper functions.
        getSliderValueFromDate={this.getSliderValueFromDate}
        getDateFromSliderValue={this.getDateFromSliderValue}
        getDateFromYearStringInput={this.getDateFromYearStringInput}
        renderVariableList={this.renderVariableList}
        renderTemporalControls={this.renderTemporalControls}
        renderFocusBoundaryMap={this.renderFocusBoundaryMap}
        renderMapLayerForSelectedVariable={this.renderMapLayerForSelectedVariable}
        updateFocusGeometry={(value) => this.focusGeometry = value}
        updateLoadedDate={(value) => this.currentLoadedDate = value}
        offsetCurrentTimeAtPrecisionByAmount={(amount) => {
          if (!amount) {
            return;
          }

          this.currentLoadedDate = offsetDateAtPrecision(this.currentLoadedDate, this.component.temporalPrecision, amount);
        }}
        isPanelOpen={this.isPanelOpen}
        togglePanelOpenState={this.togglePanelOpenState}
      />
    );
  }
}