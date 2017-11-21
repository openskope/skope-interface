import React from 'react';
import PropTypes from 'prop-types';
import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
// import PauseIcon from 'material-ui/svg-icons/av/pause';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
import WorkspaceTitle from '/imports/ui/components/workspace-title';
import LayerList from '/imports/ui/components/layerlist';
import MapView from '/imports/ui/components/mapview';
import Charts from '/imports/ui/components/workspace-charts-embedded-wrapper';
import {
  clampFilterValue,
} from '/imports/ui/helpers';

export default class WorkspacePage extends React.Component {

  static propTypes = {
    // List of layers to display.
    layers: PropTypes.arrayOf(PropTypes.object).isRequired,

    // Indicate if a point is selected for inspection.
    inspectPointSelected: PropTypes.bool.isRequired,
    // The coordinate of the point being inspected.
    inspectPointCoordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
    // Callback function for selecting a point to inspect.
    selectInspectPoint: PropTypes.func.isRequired,

    // Current value of the filter slider.
    filterValue: PropTypes.number.isRequired,

    // The range of the filter.
    rangeMin: PropTypes.number.isRequired,
    rangeMax: PropTypes.number.isRequired,

    // Callback function for updating filter value.
    updateFilterValue: PropTypes.func.isRequired,
    putFilterValueInUrl: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_rangeFilterOnChangeInput = this._rangeFilterOnChangeInput.bind(this);
    this._bound_yearStepBackButtonOnClick = this._yearStepBackButtonOnClick.bind(this);
    this._bound_yearStepForwardButtonOnClick = this._yearStepForwardButtonOnClick.bind(this);
  }

  _updateFilterValue (value) {
    const {
      updateFilterValue,
      putFilterValueInUrl,
    } = this.props;

    updateFilterValue(value);
    putFilterValueInUrl(value);
  }

  _rangeFilterOnChange (value) {
    const {
      rangeMin,
      rangeMax,
    } = this.props;

    this._updateFilterValue(clampFilterValue(value, rangeMin, rangeMax));
  }

  _rangeFilterOnChangeInput (event) {
    this._rangeFilterOnChange(event.target.value);
  }

  _yearStepBackButtonOnClick (/* event */) {
    const {
      rangeMin,
      filterValue,
    } = this.props;

    this._updateFilterValue(Math.max(rangeMin, filterValue - 1));
  }

  _yearStepForwardButtonOnClick (/* event */) {
    const {
      rangeMax,
      filterValue,
    } = this.props;

    this._updateFilterValue(Math.min(rangeMax, filterValue + 1));
  }

  _mapOnClick = (event) => this.props.selectInspectPoint && this.props.selectInspectPoint(event.latLongCoordinate);

  renderHeader = () => (
    <AppbarHeader
      title={<WorkspaceTitle />}
      onClickHelpButton={() => alert('Show help for workspace page.')}
    />
  );

  renderBody = ({
    layers,

    inspectPointSelected,
    inspectPointCoordinate,

    filterValue,
  } = this.props) => (
    <div className="page-workspace">

      <div className="section-map">

        <Tabs
          className="side-panel"
          contentContainerClassName="side-panel__content"
          //! Make this a controlled tab.
        >

          <Tab
            label="Info"
            data-slug="info"
          >
            <div className="side-panel__section">
              <p>Status</p>
              <p>Description: general description about this dataset. For environmental data this description is provided by domain experts, for model results it is provide by model configuration time.</p>
              <p>Download link(s)</p>
            </div>
          </Tab>

          <Tab
            label="Layers"
            data-slug="layers"
          >
            <LayerList
              className="side-panel__section"
              layers={layers}
            />
          </Tab>

          <Tab
            label="Graphs"
            data-slug="graphs"
          >
            <Charts
              dataSectionClassName="side-panel__section"
            />
          </Tab>

          <Tab
            label="Metadata"
            data-slug="metadata"
          >
            <div className="side-panel__section">
              <h2>Metadata</h2>
              <p>
                This is the metadata tab.
              </p>
            </div>
          </Tab>

        </Tabs>

        <div className="map-panel">

          <Toolbar
            style={{
              height: 48,
            }}
          >
            <ToolbarGroup>
              <ToolbarTitle text="Time" />

              <IconButton
                tooltip="Step back"
                onClick={this._bound_yearStepBackButtonOnClick}
              >
                <LeftArrowIcon />
              </IconButton>

              <TextField
                hintText="Year"
                type="text"
                style={{
                  width: 50,
                }}
                inputStyle={{
                  textAlign: 'center',
                }}
                value={filterValue}
                onChange={this._bound_rangeFilterOnChangeInput}
              />

              <IconButton
                tooltip="Step forward"
                onClick={this._bound_yearStepForwardButtonOnClick}
              >
                <RightArrowIcon />
              </IconButton>

              <ToolbarSeparator />

              <IconButton tooltip="Play/Pause">
                <PlayIcon />
              </IconButton>
            </ToolbarGroup>
          </Toolbar>

          <MapView
            className="map-wrapper"
            basemap="osm"
            center="-12107625, 4495720"
            zoom="5"
            onClick={this._mapOnClick}
            ref={(ref) => this._mapview = ref}
          >

            {layers.map((o) => o.element)}

            <map-layer-singlepoint
              invisible={!inspectPointSelected ? 'invisible' : null}
              latitude={inspectPointCoordinate[1]}
              longitude={inspectPointCoordinate[0]}
            />

            <map-control-defaults />
            <map-interaction-defaults />
            <map-control-simple-layer-list />

          </MapView>

        </div>

      </div>

    </div>
  );

  render () {
    const {
      layers,

      inspectPointSelected,
      inspectPointCoordinate,

      filterValue,
    } = this.props;

    return (
      <FullWindowLayout
        header={this.renderHeader()}
        body={this.renderBody()}
      />
    );
  }
}
