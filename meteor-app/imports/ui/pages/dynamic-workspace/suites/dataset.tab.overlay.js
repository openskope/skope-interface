// This is the "Map View".

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
  ToolbarTitle,
  ToolbarSeparator,
} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import ToStartIcon from 'material-ui/svg-icons/av/skip-previous';
import ToEndIcon from 'material-ui/svg-icons/av/skip-next';
import {
  SliderWithInput,
} from '/imports/ui/components/SliderWithInput';

import {
  DatasetMapIcon,
  mapToolbarStyles,
  BoxToolIcon,
} from '/imports/ui/consts';

import {
  getYearStringFromDate,
  offsetDateAtPrecision,
  buildGeoJsonWithGeometry,
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabBaseClass from './dataset.tab.BaseClass';

class OverlayTabContent extends React.Component {

  static propTypes = {
    // Some data.
    hasSelectedVariable: PropTypes.bool.isRequired,
    currentLoadedDate: PropTypes.instanceOf(Date).isRequired,
    dateRangeStart: PropTypes.instanceOf(Date).isRequired,
    dateRangeEnd: PropTypes.instanceOf(Date).isRequired,
    boundaryGeometry: PropTypes.object.isRequired,
    focusGeometry: PropTypes.object.isRequired,

    // Some helper functions.
    getSliderValueFromDate: PropTypes.func.isRequired,
    getDateFromSliderValue: PropTypes.func.isRequired,
    getDateFromYearStringInput: PropTypes.func.isRequired,
    isPanelOpen: PropTypes.func.isRequired,
    togglePanelOpenState: PropTypes.func.isRequired,
    renderVariableList: PropTypes.func.isRequired,
    renderTemporalControls: PropTypes.func.isRequired,
    renderMapLayerForSelectedVariable: PropTypes.func.isRequired,
    updateFocusGeometry: PropTypes.func.isRequired,
    updateLoadedDate: PropTypes.func.isRequired,
    offsetCurrentTimeAtPrecisionByAmount: PropTypes.func.isRequired,
    getGeometryFromExtent: PropTypes.func.isRequired,
    getExtentFromGeometry: PropTypes.func.isRequired,
    getGeometryFromOlGeometry: PropTypes.func.isRequired,
  };

  static defaultLayerOpacity = 1;

  static selectionTools = [
    {
      name: 'rectangle',
      IconClass: BoxToolIcon,
      title: 'Rectangle tool',
      drawingType: 'Box',
    },
  ];

  constructor (props) {
    super(props);

    this._overviewMap = null;
    this._detailMap = null;
    this._focusGeometryDrawingLayer = null;
    this._focusGeometryDrawingInteraction = null;

    const defaultSelectionTool = OverlayTabContent.selectionTools[0];

    this.state = {
      // Copy of the date for the sliders.
      currentLoadedDateTemporal: props.currentLoadedDate,
      // @type {Object<layerId: string, opacity: number>}
      layerOpacity: {},
      // @type {string}
      activeSelectionToolName: defaultSelectionTool.name,
      // @type {string|null}
      activeDrawingType: defaultSelectionTool.drawingType,
      // @type {boolean}
      isPlaying: false,
      animationTimer: null,
    };
  }

  componentDidMount () {
    this.connectOverviewMap();
  }

  shouldComponentUpdate (nextProps, nextState) {
    return ![
      _.isEqual(nextProps, this.props),
      _.isEqual(nextState, this.state),
    ].every(Boolean);
  }

  componentWillUpdate () {
    this.disconnectOverviewMap();
  }

  componentDidUpdate () {
    this.connectOverviewMap();
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

  onStartDrawingNewFocusGeometry = () => {
    this.clearFocusFeatureDrawing();
  };

  onDrawNewFocusFeature = (olEvent) => {
    const olGeometry = olEvent.feature.getGeometry();
    const jsonGeometry = this.props.getGeometryFromOlGeometry(olGeometry);

    // Report new focus geometry.
    this.props.updateFocusGeometry(jsonGeometry);

    this.clearFocusFeatureDrawing();
  };

  onChangeViewingExtent = _.throttle(() => {
    if (!(this._detailMap && this._detailMap.map)) {
      return;
    }

    const newExtent = this._detailMap.map.extent;
    const extenJsonGeometry = this.props.getGeometryFromExtent(newExtent);

    // Report new focus geometry.
    this.props.updateFocusGeometry(extenJsonGeometry);
  }, 3);

  /**
   * @param {string} layerId
   */
  getLayerOpacity (layerId) {
    return layerId in this.state.layerOpacity
           ? this.state.layerOpacity[layerId]
           : OverlayTabContent.defaultLayerOpacity;
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

  setSelectionToolActive (tool) {
    this.setState({
      activeSelectionToolName: tool.name,
      activeDrawingType: tool.drawingType,
    });

    // Setting focus gemoetry to null should load the default focus geometry.
    this.props.updateFocusGeometry(null);

    // If the new tool can't draw, don't clear existing features.
    if (tool.drawingType) {
      this.clearFocusFeatureDrawing();
    }
  }

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

  isSelectionToolActive (tool) {
    return this.state.activeSelectionToolName === tool.name;
  }

  clearFocusFeatureDrawing () {
    if (this._focusGeometryDrawingLayer) {
      this._focusGeometryDrawingLayer.clearFeatures();
    }
  }

  connectOverviewMap () {
    // Restrict to have at most 1 feature in the layer.
    if (this._focusGeometryDrawingInteraction) {
      this._focusGeometryDrawingInteraction.addEventListener('drawstart', this.onStartDrawingNewFocusGeometry);
    }
    // When a new box is drawn, update the viewing extent.
    if (this._focusGeometryDrawingLayer) {
      this._focusGeometryDrawingLayer.addEventListener('addfeature', this.onDrawNewFocusFeature);
    }
    // When the viewing extent is changed, reflect on the overview.
    if (this._detailMap && this._detailMap.map) {
      this._detailMap.map.addEventListener('change:extent', this.onChangeViewingExtent);
    }
  }

  disconnectOverviewMap () {
    if (this._focusGeometryDrawingInteraction) {
      this._focusGeometryDrawingInteraction.removeEventListener('drawstart', this.onStartDrawingNewFocusGeometry);
    }
    if (this._focusGeometryDrawingLayer) {
      this._focusGeometryDrawingLayer.removeEventListener('addfeature', this.onDrawNewFocusFeature);
    }
    if (this._detailMap && this._detailMap.map) {
      this._detailMap.map.removeEventListener('change:extent', this.onChangeViewingExtent);
    }
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

  render () {
    const {
      hasSelectedVariable,
      dateRangeStart,
      dateRangeEnd,
      boundaryGeometry,
      focusGeometry,
    } = this.props;
    const {
      currentLoadedDateTemporal,
      activeDrawingType,
    } = this.state;

    const boundaryExtent = this.props.getExtentFromGeometry(boundaryGeometry);
    const boundaryGeoJson = buildGeoJsonWithGeometry(boundaryGeometry);
    const boundaryGeoJsonString = boundaryGeoJson && JSON.stringify(boundaryGeoJson);
    const focusExtent = this.props.getExtentFromGeometry(focusGeometry);
    const focusBoundaryGeoJson = buildGeoJsonWithGeometry(focusGeometry);
    const focusBoundaryGeoJsonString = focusBoundaryGeoJson && JSON.stringify(focusBoundaryGeoJson);

    return (
      <div className="dataset__overlay-tab">
        <Paper
          className="overlay__controls"
          zDepth={1}
        >
          <List>
            {this.props.renderVariableList({})}
            {this.props.renderTemporalControls({
              disabled: !hasSelectedVariable || this.isPlaying,
            })}

            <ListItem
              key="spatial-overview"
              primaryText="Spatial overview"
              primaryTogglesNestedList
              open={this.props.isPanelOpen('spatial-overview')}
              onNestedListToggle={() => this.props.togglePanelOpenState('spatial-overview')}
              nestedItems={[
                <ListItem
                  disabled
                  key="map"
                >
                  <Toolbar
                    style={{
                      ...mapToolbarStyles.root,
                    }}
                  >
                    <ToolbarGroup>
                      <ToolbarTitle
                        text="Tools"
                        style={{
                          ...mapToolbarStyles.title,
                        }}
                      />
                    </ToolbarGroup>
                    <ToolbarGroup>
                      {OverlayTabContent.selectionTools.map((item) => (
                        <RaisedButton
                          key={item.name}
                          className="selection-tool-button"
                          icon={<item.IconClass style={mapToolbarStyles.toggleButton.icon} />}
                          style={{
                            ...mapToolbarStyles.toggleButton.root,
                            ...(this.isSelectionToolActive(item) && mapToolbarStyles.toggleButton.active),
                          }}
                          buttonStyle={mapToolbarStyles.toggleButton.button}
                          overlayStyle={{
                            ...mapToolbarStyles.toggleButton.overlay,
                          }}
                          onClick={() => this.setSelectionToolActive(item)}
                        />
                      ))}
                    </ToolbarGroup>
                  </Toolbar>
                  <MapView
                    className="overview-map"
                    basemap="arcgis"
                    projection="EPSG:4326"
                    extent={boundaryExtent}
                    style={{
                      '--aspect-ratio': '4/3',
                    }}
                    ref={(ref) => this._overviewMap = ref}
                  >
                    {hasSelectedVariable && this.props.renderMapLayerForSelectedVariable({})}
                    {boundaryGeoJsonString && (
                      <map-layer-geojson
                        id="boundary-geometry-display-layer"
                        src-json={boundaryGeoJsonString}
                        src-projection="EPSG:4326"
                        opacity="0.3"
                      />
                    )}
                    {focusBoundaryGeoJsonString && (
                      <map-layer-geojson
                        id="focus-geometry-display-layer"
                        src-json={focusBoundaryGeoJsonString}
                        src-projection="EPSG:4326"
                      />
                    )}
                    <map-layer-vector
                      id="focus-geometry-drawing-layer"
                      ref={(ref) => this._focusGeometryDrawingLayer = ref}
                    />
                    <map-interaction-draw
                      disabled={activeDrawingType ? null : 'disabled'}
                      source="focus-geometry-drawing-layer"
                      type={activeDrawingType}
                      ref={(ref) => this._focusGeometryDrawingInteraction = ref}
                    />
                  </MapView>
                </ListItem>,
              ]}
            />
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
            extent={focusExtent}
            ref={(ref) => this._detailMap = ref}
          >
            {hasSelectedVariable && this.props.renderMapLayerForSelectedVariable()}
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
                disabled={!hasSelectedVariable || !this.isBackStepInTimeAllowed}
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
                disabled={!hasSelectedVariable}
                onClick={this.onClickPlayButton}
              >
                {this.isPlaying
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
                disabled={!hasSelectedVariable || !this.isForwardStepInTimeAllowed}
                onClick={this.onClickToEndButton}
              >
                <ToEndIcon />
              </IconButton>
            </ToolbarGroup>

            <ToolbarGroup />
          </Toolbar>

          <SliderWithInput
            label="Date (year)"
            min={dateRangeStart}
            max={dateRangeEnd}
            value={currentLoadedDateTemporal}
            disabled={!hasSelectedVariable}
            // (Date) => number
            toSliderValue={this.props.getSliderValueFromDate}
            // (number) => Date
            fromSliderValue={this.props.getDateFromSliderValue}
            // (Date) => string
            toInputValue={getYearStringFromDate}
            // (string) => Date
            fromInputValue={this.props.getDateFromYearStringInput}
            onChange={(event, date) => this.setState({ currentLoadedDateTemporal: date })}
            onFinish={(event, date) => this.props.updateLoadedDate(date)}
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
        isPanelOpen={this.isPanelOpen}
        togglePanelOpenState={this.togglePanelOpenState}
        renderVariableList={this.renderVariableList}
        renderTemporalControls={this.renderTemporalControls}
        renderMapLayerForSelectedVariable={this.renderMapLayerForSelectedVariable}
        updateFocusGeometry={(value) => this.focusGeometry = value}
        updateLoadedDate={(value) => this.currentLoadedDate = value}
        offsetCurrentTimeAtPrecisionByAmount={(amount) => {
          if (!amount) {
            return;
          }

          this.currentLoadedDate = offsetDateAtPrecision(this.currentLoadedDate, this.component.temporalPrecision, amount);
        }}
        getGeometryFromExtent={this.component.getGeometryFromExtent}
        getExtentFromGeometry={this.component.getExtentFromGeometry}
        getGeometryFromOlGeometry={this.component.getGeometryFromOlGeometry}
      />
    );
  }
}
