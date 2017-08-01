import React from 'react';
import PropTypes from 'prop-types';

export default class ModelPage extends React.Component {

  static propTypes = {
    // Indicate if a point is selected for inspection.
    inspectPointSelected: PropTypes.bool.isRequired,
    // The coordinate of the point being inspected.
    inspectPointCoordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
    // Callback function for selecting a point to inspect.
    selectInspectPoint: PropTypes.func.isRequired,

    // The state of the map modal.
    mapShown: PropTypes.bool.isRequired,
    // Callback function for the map modal.
    toggleMap: PropTypes.func.isRequired,

    // Callback function for the form.
    updateForm: PropTypes.func.isRequired,

    // Values in the form.
    predictionYears: PropTypes.number.isRequired,
    meanVar: PropTypes.string.isRequired,
    minWidth: PropTypes.number.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_mapOnClick = this._mapOnClick.bind(this);
    this._bound_toggleMap = this._toggleMap.bind(this);
    this._bound_updateLatitude = this._updateLatitude.bind(this);
    this._bound_updateLongitude = this._updateLongitude.bind(this);
    this._bound_updatePredictionYears = this._updatePredictionYears.bind(this);
    this._bound_updateMeanVar = this._updateMeanVar.bind(this);
    this._bound_updateMinWidth = this._updateMinWidth.bind(this);
  }

  componentDidMount () {
    if (this._mapview) {
      this._mapview.addEventListener('click:view', this._bound_mapOnClick);
    }
  }

  _mapOnClick (event) {
    const {
      selectInspectPoint,
    } = this.props;

    selectInspectPoint(event.latLongCoordinate);
  }

  _toggleMap(/* event */) {
    const {
      toggleMap,
    } = this.props;

    toggleMap();
  }

  _updateLatitude(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      predictionYears,
      meanVar,
      minWidth,
    } = this.props;

    updateForm({
      latitude: parseFloat(target.value),
      longitude: inspectPointCoordinate[0],
      predictionYears,
      meanVar,
      minWidth,
    });
  }

  _updateLongitude(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      predictionYears,
      meanVar,
      minWidth,
    } = this.props;

    updateForm({
      latitude: inspectPointCoordinate[1],
      longitude: parseFloat(target.value),
      predictionYears,
      meanVar,
      minWidth,
    });
  }

  _updatePredictionYears(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      meanVar,
      minWidth,
    } = this.props;

    updateForm({
      latitude: inspectPointCoordinate[1],
      longitude: inspectPointCoordinate[0],
      predictionYears: parseInt(target.value, 10),
      meanVar,
      minWidth,
    });
  }

  _updateMeanVar(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      predictionYears,
      minWidth,
    } = this.props;

    updateForm({
      latitude: inspectPointCoordinate[1],
      longitude: inspectPointCoordinate[0],
      predictionYears,
      meanVar: target.value,
      minWidth,
    });
  }

  _updateMinWidth(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      predictionYears,
      meanVar,
    } = this.props;

    updateForm({
      latitude: inspectPointCoordinate[1],
      longitude: inspectPointCoordinate[0],
      predictionYears,
      meanVar,
      minWidth: parseInt(target.value, 10),
    });
  }

  render () {
    const {
      inspectPointSelected,
      inspectPointCoordinate,

      mapShown,
      predictionYears,
      meanVar,
      minWidth,
    } = this.props;

    return (
      <div className="page--model">

        <div className="section-form">

          <div>
            <button onClick={this._bound_toggleMap}>Select coordinates</button>
          </div>

          <div>
            <label>Latitude:</label>
            <input type="text" value={inspectPointCoordinate[1]} onChange={this._bound_updateLatitude} />
          </div>

          <div>
            <label>Longitude:</label>
            <input type="text" value={inspectPointCoordinate[0]} onChange={this._bound_updateLongitude} />
          </div>

          <div>
            <label>Prediction years:</label>
            <input type="text" value={predictionYears} onChange={this._bound_updatePredictionYears} />
          </div>

          <div>
            <label>Mean variance:</label>
            <select value={meanVar} onChange={this._bound_updateMeanVar}>
              <option value="none">none</option>
              <option value="calibration">calibration</option>
              <option value="chained">chained</option>
            </select>
          </div>

          <div>
            <label>Minimum width:</label>
            <input type="text" value={minWidth} onChange={this._bound_updateMinWidth} />
          </div>

          <a
            href={`data:text/json;base64,${btoa(JSON.stringify({
              latitude: inspectPointCoordinate[1],
              longitude: inspectPointCoordinate[0],
              predictionYears,
              meanVar,
              minWidth,
            }, null, 2))}`}
            download="data.json"
          >Download JSON</a>

        </div>

        <div className={mapShown ? 'section-map' : 'hidden'}>

          <div className="map_background" />

          <map-view
            class="the-map"
            basemap="osm"
            center="-12107625, 4495720"
            zoom="5"
            ref={ref => this._mapview = ref}
          >

            <map-layer-singlepoint
              invisible={!inspectPointSelected ? 'invisible' : null}
              latitude={inspectPointCoordinate[1]}
              longitude={inspectPointCoordinate[0]}
            />

            <map-control-defaults />
            <map-interaction-defaults />
            <map-control-simple-layer-list />

          </map-view>

        </div>

      </div>
    );
  }
}
