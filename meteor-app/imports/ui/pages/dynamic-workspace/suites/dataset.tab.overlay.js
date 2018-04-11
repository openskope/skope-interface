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
} from '/imports/ui/helpers';

import MapView from '/imports/ui/components/mapview';

import TabBaseClass from './dataset.tab.BaseClass';

class OverlayTabContent extends React.Component {

  static propTypes = {
    // Some helper functions.
    getPreciseDateWithinTimespan: PropTypes.func.isRequired,
    getSliderValueFromDate: PropTypes.func.isRequired,
    getDateFromSliderValue: PropTypes.func.isRequired,
    getDateFromYearStringInput: PropTypes.func.isRequired,
    isPanelOpen: PropTypes.func.isRequired,
    togglePanelOpenState: PropTypes.func.isRequired,
    renderVariableList: PropTypes.func.isRequired,
    renderTemporalControls: PropTypes.func.isRequired,

    // Some data.
    temporalPrecision: PropTypes.any.isRequired,
    boundaryExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
    boundaryGeoJsonString: PropTypes.string.isRequired,
    dateRangeStart: PropTypes.instanceOf(Date).isRequired,
    dateRangeEnd: PropTypes.instanceOf(Date).isRequired,
    hasSelectedVariable: PropTypes.bool.isRequired,

    // Some components.
    mapLayerOfTheSelectedVariable: PropTypes.any.isRequired,
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
    this._extentDrawingLayer = null;
    this._extentDrawingInteraction = null;

    const defaultSelectionTool = OverlayTabContent.selectionTools[0];

    this.state = {
      // @type {Object<layerId: string, opacity: number>}
      layerOpacity: {},
      viewingExtent: props.boundaryExtent,
      // @type {string}
      activeSelectionToolName: defaultSelectionTool.name,
      // @type {string|null}
      activeDrawingType: defaultSelectionTool.drawingType,
      // @type {Date}
      currentLoadedDate: props.dateRangeStart,
      // @type {boolean}
      isPlaying: false,
      animationTimer: null,
    };
  }

  componentDidMount () {
    this.connectOverviewMap();
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
      this.offsetCurrentTimeAtPrecisionByAmount(1);
    } else {
      this.stopAnimation();
    }
  };

  onChangeLoadedDate = (event, date) => {
    const preciseDate = this.props.getPreciseDateWithinTimespan(date);

    if (preciseDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: preciseDate,
    });
  };

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
      viewingExtent: this.props.boundaryExtent,
      activeSelectionToolName: tool.name,
      activeDrawingType: tool.drawingType,
    });

    // If the new tool can't draw, don't clear existing features.
    if (tool.drawingType) {
      this.clearExtentFeature();
    }
  }

  get isPlaying () {
    return this.state.isPlaying;
  }

  /**
   * @return {boolean}
   */
  get isBackStepInTimeAllowed () {
    return this.state.currentLoadedDate > this.props.dateRangeStart;
  }
  /**
   * @return {boolean}
   */
  get isForwardStepInTimeAllowed () {
    return this.state.currentLoadedDate < this.props.dateRangeEnd;
  }

  isSelectionToolActive (tool) {
    return this.state.activeSelectionToolName === tool.name;
  }

  clearExtentFeature = () => {
    if (this._extentDrawingLayer) {
      this._extentDrawingLayer.clearFeatures();
    }
  };

  updateViewingExtentOnAddNewExtentFeature = (olEvent) => {
    this.setState({
      viewingExtent: olEvent.feature.getGeometry().getExtent(),
    });
  };

  updateExtentFeatureOnChangeViewingExtent = () => {
    if (!(this._detailMap && this._detailMap.map && this._extentDrawingLayer)) {
      return;
    }

    const extent = this._detailMap.map.extent;
    const extentGeometry = this._extentDrawingLayer.createGeometryFromExtent(extent);
    const features = this._extentDrawingLayer.getFeatures();

    if (features.length > 0) {
      const extentFeature = features[0];

      extentFeature.setGeometry(extentGeometry);
    } else {
      this._extentDrawingLayer.addFeature(this._extentDrawingLayer.createFeature(extentGeometry));
    }
  };

  connectOverviewMap () {
    // Restrict to have at most 1 feature in the layer.
    if (this._extentDrawingInteraction) {
      this._extentDrawingInteraction.addEventListener('drawstart', this.clearExtentFeature);
    }
    // When a new box is drawn, update the viewing extent.
    if (this._extentDrawingLayer) {
      this._extentDrawingLayer.addEventListener('addfeature', this.updateViewingExtentOnAddNewExtentFeature);
    }
    // When the viewing extent is changed, reflect on the overview.
    if (this._detailMap && this._detailMap.map) {
      this._detailMap.map.addEventListener('change:extent', this.updateExtentFeatureOnChangeViewingExtent);
    }
  }

  disconnectOverviewMap () {
    if (this._extentDrawingInteraction) {
      this._extentDrawingInteraction.removeEventListener('drawstart', this.clearExtentFeature);
    }
    if (this._extentDrawingLayer) {
      this._extentDrawingLayer.removeEventListener('addfeature', this.updateViewingExtentOnAddNewExtentFeature);
    }
    if (this._detailMap && this._detailMap.map) {
      this._detailMap.map.removeEventListener('change:extent', this.updateExtentFeatureOnChangeViewingExtent);
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

    this.setState({
      currentLoadedDate: this.props.dateRangeStart,
    });
  }
  skipAnimationToEnd () {
    console.log('skipping animation to end');

    this.setState({
      currentLoadedDate: this.props.dateRangeEnd,
    });
  }

  offsetCurrentTimeAtPrecisionByAmount = (amount) => {
    if (!amount) {
      return;
    }

    const maxDate = this.props.dateRangeEnd;
    const minDate = this.props.dateRangeStart;
    let newLoadedDate = offsetDateAtPrecision(this.state.currentLoadedDate, this.props.temporalPrecision, amount);

    if (newLoadedDate.valueOf() > maxDate.valueOf()) {
      newLoadedDate = maxDate;
    }

    if (newLoadedDate.valueOf() < minDate.valueOf()) {
      newLoadedDate = minDate;
    }

    if (newLoadedDate.valueOf() === this.state.currentLoadedDate.valueOf()) {
      return;
    }

    this.setState({
      currentLoadedDate: newLoadedDate,
    });
  };

  render () {
    const {
      getSliderValueFromDate,
      getDateFromSliderValue,
      getDateFromYearStringInput,
      isPanelOpen,
      togglePanelOpenState,
      renderVariableList,
      renderTemporalControls,

      boundaryExtent,
      boundaryGeoJsonString,
      dateRangeStart,
      dateRangeEnd,
      hasSelectedVariable,

      mapLayerOfTheSelectedVariable,
    } = this.props;
    const {
      currentLoadedDate,
      viewingExtent,
      activeDrawingType,
    } = this.state;

    return (
      <div className="dataset__overlay-tab">
        <Paper
          className="overlay__controls"
          zDepth={1}
        >
          <List>
            {renderVariableList({})}
            {renderTemporalControls({
              disabled: !hasSelectedVariable || this.isPlaying,
            })}

            <ListItem
              key="spatial-overview"
              primaryText="Spatial overview"
              primaryTogglesNestedList
              open={isPanelOpen('spatial-overview')}
              onNestedListToggle={() => togglePanelOpenState('spatial-overview')}
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
                    {mapLayerOfTheSelectedVariable}
                    {boundaryGeoJsonString && (
                      <map-layer-geojson
                        src-json={boundaryGeoJsonString}
                        src-projection="EPSG:4326"
                      />
                    )}
                    <map-layer-vector
                      id="extent-drawing-layer"
                      ref={(ref) => this._extentDrawingLayer = ref}
                    />
                    <map-interaction-draw
                      disabled={activeDrawingType ? null : 'disabled'}
                      source="extent-drawing-layer"
                      type={activeDrawingType}
                      ref={(ref) => this._extentDrawingInteraction = ref}
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
            extent={viewingExtent}
            ref={(ref) => this._detailMap = ref}
          >
            {mapLayerOfTheSelectedVariable}
            {boundaryGeoJsonString && (
              <map-layer-geojson
                src-json={boundaryGeoJsonString}
                src-projection="EPSG:4326"
              />
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
            value={currentLoadedDate}
            disabled={!hasSelectedVariable}
            // (Date) => number
            toSliderValue={getSliderValueFromDate}
            // (number) => Date
            fromSliderValue={getDateFromSliderValue}
            // (Date) => string
            toInputValue={getYearStringFromDate}
            // (string) => Date
            fromInputValue={getDateFromYearStringInput}
            onChange={this.onChangeLoadedDate}
            inputStyle={{
              width: '60px',
            }}
            sliderProps={{
              included: false,
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

  onDeactivate (event) {
    super.onDeactivate(event);

    if (this.state.isPlaying) {
      this.stopAnimation();
    }
  }

  renderBody () {
    const boundaryGeoJson = this.component.boundaryGeoJson;
    const hasSelectedVariable = this.hasSelectedVariable;

    return (
      <OverlayTabContent
        // Some helper functions.
        getPreciseDateWithinTimespan={this.getPreciseDateWithinTimespan}
        getSliderValueFromDate={this.getSliderValueFromDate}
        getDateFromSliderValue={this.getDateFromSliderValue}
        getDateFromYearStringInput={this.getDateFromYearStringInput}
        isPanelOpen={this.isPanelOpen}
        togglePanelOpenState={this.togglePanelOpenState}
        renderVariableList={this.renderVariableList}
        renderTemporalControls={this.renderTemporalControls}

        // Some data.
        temporalPrecision={this.component.temporalPrecision}
        boundaryExtent={this.component.extent}
        boundaryGeoJsonString={boundaryGeoJson && JSON.stringify(boundaryGeoJson)}
        dateRangeStart={this.dateRangeStart}
        dateRangeEnd={this.dateRangeEnd}
        hasSelectedVariable={hasSelectedVariable}

        // Some components.
        mapLayerOfTheSelectedVariable={hasSelectedVariable && this.renderMapLayerForSelectedVariable()}
      />
    );
  }
}
