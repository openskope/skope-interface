import React from 'react';
import PropTypes from 'prop-types';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

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
      <div className="page--paleocar">

        <div className="section-map">
          <div className="side-panel">

            <div className="mdc-toolbar">
              <div className="mdc-toolbar__row">
                <section className="mdc-toolbar__section mdc-toolbar__section--align-start">
                  <span className="mdc-toolbar__title">PaleoCAR</span>
                </section>
              </div>
            </div>

            <div className="side-panel__form">
              <div className="form-row">
                <label htmlFor="css-only-textfield">Scenario Name:</label>
                <div className="mdc-textfield mdc-textfield--fullwidth">
                  <input type="text" className="mdc-textfield__input" id="css-only-textfield" placeholder="Name" />
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="css-only-multiline">Description</label>
                <div className="mdc-textfield mdc-textfield--multiline" htmlFor="css-only-multiline">
                  <textarea className="mdc-textfield__input" id="css-only-multiline" placeholder="Describe your scenario." rows="8" cols="40"></textarea>
                </div>
              </div>
              <div className="form-row">
                <label for="css-only-textfield">Prediction years:</label>
                <div className="mdc-textfield mdc-textfield--fullwidth">
                  <input type="text"
                         className="mdc-textfield__input"
                         id="css-only-textfield"
                         placeholder="1775,1901-1905"
                         onChange={this._bound_updatePredictionYears} />
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="css-only-textfield">Minimum width:</label>
                <div className="mdc-textfield mdc-textfield--fullwidth">
                  <input type="text"
                         className="mdc-textfield__input"
                         id="css-only-textfield"
                         placeholder="Number"
                         onChange={this._bound_updateMinWidth} />
                </div>
              </div>

              <div className="form-row">
                <label>Mean variance:</label>
                <select className="mdc-select" value={meanVar} onChange={this._bound_updateMeanVar}>
                  <option value="">Pick a variance</option>
                  <option value="none">None</option>
                  <option value="calibration">Calibration</option>
                  <option value="chained">Chained</option>
                </select>
              </div>

              <div className="form-row-button">
                <a href={FlowRouter.url('/search')}><button className="mdc-button mdc-button--raised">Submit</button></a>
                <a
                      href={`data:text/json;base64,${btoa(JSON.stringify({
                          latitude: inspectPointCoordinate[1],
                          longitude: inspectPointCoordinate[0],
                          predictionYears,
                          meanVar,
                          minWidth,
                      }, null, 2))}`}
                      download="data.json">
                  <button className="mdc-button mdc-button--raised">Download JSON</button></a>

              </div>


            </div>
          </div>

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
