// This is the "Map View".
/* global HTMLMapLayerVector */

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
import FlatButton from 'material-ui/FlatButton';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import ToStartIcon from 'material-ui/svg-icons/av/skip-previous';
import ToEndIcon from 'material-ui/svg-icons/av/skip-next';
import store from 'store';

import {
  DatasetMapIcon,
  PanToolIcon,
  BoxToolIcon,
  presentationProjection,
  maxMapZoomLevel,
  minMapZoomLevel,
  baseMaps,
} from '/imports/ui/consts';

import {
  offsetDateAtPrecision,
  buildGeoJsonWithGeometry,
} from '/imports/ui/helpers';

import {
  SliderWithInput,
} from '/imports/ui/components/SliderWithInput';
import MapView from '/imports/ui/components/mapview';

import TabComponent from '../../TabComponent';

const selectionTools = [
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

export default
class OverlayTab extends TabComponent {

  static propTypes = {
    ...TabComponent.propTypes,
    overlays: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      type: PropTypes.string,
      url: PropTypes.string,
      min: PropTypes.number,
      max: PropTypes.number,
      styles: PropTypes.arrayOf(PropTypes.string),
    })).isRequired,
  };

  static tabName = 'overlay';
  static tabIcon = DatasetMapIcon;
  static tabLabel = 'Map View';
  static requiredProps = [
    'overlays',
  ];

  constructor (props) {
    super(props);

    const {
      skopeid,
      workspace: {
        dateOfTheCurrentlyDisplayedFrame,
      },
    } = props;

    const storedBaseMapIndex = store.get('workspace.overlay.baseMapIndex');

    this._detailMap = null;

    this.state = {
      // Copy of the date for the sliders.
      animatedCopyOfDateOfTheCurrentlyDisplayedFrame: dateOfTheCurrentlyDisplayedFrame,
      // @type {boolean}
      isPlaying: false,
      animationTimer: null,
      // @type {number}
      baseMapIndex: typeof storedBaseMapIndex === 'undefined' ? 0 : storedBaseMapIndex,
      //! Temporary fix.
      disableContinuousPlayback: skopeid === 'prism-climate-data',
    };
  }

  componentDidMount () {
    this.connectOverviewMap();
  }

  componentWillReceiveProps (nextProps) {
    const {
      workspace: {
        dateOfTheCurrentlyDisplayedFrame,
      },
    } = nextProps;
    const updates = {};

    if (dateOfTheCurrentlyDisplayedFrame.valueOf() !== this.state.animatedCopyOfDateOfTheCurrentlyDisplayedFrame.valueOf()) {
      updates.animatedCopyOfDateOfTheCurrentlyDisplayedFrame = dateOfTheCurrentlyDisplayedFrame;
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
      this.offsetCurrentTimeAtPrecisionByAmount(1);
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
    const {
      workspace: {
        dateOfTheCurrentlyDisplayedFrame,
        dateRangeOfFocus,
      },
    } = this.props;

    return dateOfTheCurrentlyDisplayedFrame > dateRangeOfFocus[0];
  }
  /**
   * @return {boolean}
   */
  get isForwardStepInTimeAllowed () {
    const {
      workspace: {
        dateOfTheCurrentlyDisplayedFrame,
        dateRangeOfFocus,
      },
    } = this.props;

    return dateOfTheCurrentlyDisplayedFrame < dateRangeOfFocus[1];
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

    const {
      workspace,
      workspace: {
        dateRangeOfFocus,
      },
    } = this.props;

    workspace.dateOfTheCurrentlyDisplayedFrame = dateRangeOfFocus[0];
  }
  skipAnimationToEnd () {
    console.log('skipping animation to end');

    const {
      workspace,
      workspace: {
        dateRangeOfFocus,
      },
    } = this.props;

    workspace.dateOfTheCurrentlyDisplayedFrame = dateRangeOfFocus[1];
  }

  offsetCurrentTimeAtPrecisionByAmount (amount) {
    if (!amount) {
      return;
    }

    const {
      workspace,
    } = this.props;

    workspace.dateOfTheCurrentlyDisplayedFrame = offsetDateAtPrecision(workspace.dateOfTheCurrentlyDisplayedFrame, workspace.temporalPrecision, amount);
  }

  setActiveBaseMap (newIndex) {
    store.set('workspace.overlay.baseMapIndex', newIndex);
    this.setState({
      baseMapIndex: newIndex,
    });
  }

  renderAnimationControls () {
    const {
      workspace: {
        hasSelectedVariable,
      },
    } = this.props;
    const {
      disableContinuousPlayback,
    } = this.state;

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
          {disableContinuousPlayback
            ? (
              <FlatButton
                label="Play"
                icon={<PlayIcon />}
                disabled
                style={{
                  width: '6.5em',
                  margin: false,
                }}
                title="Continuous playback disabled for this dataset."
              />
            )
            : (
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
            )
          }

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
      workspace,
      workspace: {
        hasSelectedVariable,
        timespan,
        dateRangeOfFocus: [
          dateRangeStart,
          dateRangeEnd,
        ],
        getSliderValueFromDate,
        getDateFromSliderValue,
        getInputValueFromDate,
        getDateFromInputValue,
      },
    } = this.props;
    const {
      animatedCopyOfDateOfTheCurrentlyDisplayedFrame,
    } = this.state;

    return (
      <SliderWithInput
        label={`Date (${timespan.resolution}):`}
        min={dateRangeStart}
        max={dateRangeEnd}
        value={animatedCopyOfDateOfTheCurrentlyDisplayedFrame}
        disabled={!hasSelectedVariable}
        // (Date) => number
        toSliderValue={getSliderValueFromDate}
        // (number) => Date
        fromSliderValue={getDateFromSliderValue}
        // (Date) => string
        toInputValue={getInputValueFromDate}
        // (string) => Date
        fromInputValue={getDateFromInputValue}
        onChange={(event, date) => this.setState({ animatedCopyOfDateOfTheCurrentlyDisplayedFrame: date })}
        onFinish={(event, date) => workspace.dateOfTheCurrentlyDisplayedFrame = date}
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
          type: 'text',
          min: getInputValueFromDate(dateRangeStart),
          max: getInputValueFromDate(dateRangeEnd),
        }}
      />
    );
  }

  renderBaseMapLayerAndSelector () {
    const {
      workspace: {
        renderBaseMapLayer,
      },
    } = this.props;
    const {
      baseMapIndex,
    } = this.state;
    const validBaseMapIndex = Math.max(Math.min(baseMapIndex, baseMaps.length - 1), 0);

    return (
      <React.Fragment>
        {baseMaps.length > 0 && renderBaseMapLayer(baseMaps[validBaseMapIndex])}

        {baseMaps.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '5px',
              left: '50px',
              pointerEvents: 'auto',
            }}
          >
            <select
              value={validBaseMapIndex}
              onChange={(event) => this.setActiveBaseMap(event.target.value)}
            >
              {baseMaps.map((baseMap, index) => (
                <option
                  key={index}
                  value={index}
                >
                  {baseMap.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </React.Fragment>
    );
  }

  render () {
    const {
      workspace: {
        SidePanelCommonCollapsibleSectionContainer,
        hasSelectedVariable,
        geometryOfDataBoundary,
        geometryOfFocus,
        renderVariableList,
        renderTemporalControls,
        renderFocusBoundaryMap,
        renderMapLayerForSelectedVariable,
      },
    } = this.props;

    const focusBoundaryGeoJson = buildGeoJsonWithGeometry(geometryOfFocus);
    const focusBoundaryGeoJsonString = focusBoundaryGeoJson && JSON.stringify(focusBoundaryGeoJson);
    const finalFocusGeometry = geometryOfFocus || geometryOfDataBoundary;
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
              selectionTools,
            })}
          </List>
        </Paper>

        <Paper
          className="overlay__map"
          zDepth={0}
        >
          <MapView
            className="mapview"
            projection={presentationProjection}
            extent={focusExtent}
            ref={(ref) => this._detailMap = ref}
          >
            <map-interaction-defaults />
            <map-control-defaults />
            <map-control-mouse-position slot="right-dock" />

            {this.renderBaseMapLayerAndSelector()}

            {hasSelectedVariable && renderMapLayerForSelectedVariable({
              legend: true,
              legendStyle: {
                paddingLeft: '2px',
                paddingRight: '2px',
                marginRight: 'auto',
              },
            })}
            {focusBoundaryGeoJsonString && (
              <map-layer-geojson
                style={{
                  // Do not use any fill so the variable overlay is not affected.
                  fill: 'none',
                }}
                src-json={focusBoundaryGeoJsonString}
              />
            )}
          </MapView>

          <List>
            <SidePanelCommonCollapsibleSectionContainer
              id="overlay-animation"
              label="Animation"
            >
              <ListItem
                disabled
                key="animation-controls"
                style={{
                  padding: '0',
                }}
              >{this.renderAnimationControls()}</ListItem>
              <ListItem
                disabled
                key="animation-timeline"
                style={{
                  padding: '0',
                }}
              >{this.renderTimeline()}</ListItem>
            </SidePanelCommonCollapsibleSectionContainer>
          </List>
        </Paper>
      </div>
    );
  }
}
