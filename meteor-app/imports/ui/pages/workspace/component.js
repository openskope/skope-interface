import React from 'react';
import PropTypes from 'prop-types';

import Charts from '/imports/ui/components/charts/container';

export default class WorkspacePage extends React.Component {

  static propTypes = {
    // List of layers to display.
    layers: PropTypes.arrayOf(PropTypes.object).isRequired,
    // Callback function for toggling the visibility of layers.
    toggleLayer: PropTypes.func.isRequired,
    // Callback function for toggling the opacity of layers.
    updateLayerOpacity: PropTypes.func.isRequired,

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

    // The state of the welcome window.
    welcomeWindowClosed: PropTypes.bool.isRequired,
    // Callback functions for closing the welcome window.
    closeWelcomeWindow: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_rangeFilterOnChange = this._rangeFilterOnChange.bind(this);
    this._bound_yearStepBackButtonOnClick = this._yearStepBackButtonOnClick.bind(this);
    this._bound_yearStepForwardButtonOnClick = this._yearStepForwardButtonOnClick.bind(this);
    this._bound_layerVisibilityOnChange = this._layerVisibilityOnChange.bind(this);
    this._bound_layerOpacityOnChange = this._layerOpacityOnChange.bind(this);
    this._bound_mapOnClick = this._mapOnClick.bind(this);
    this._bound_closeWelcomeWindow = this._closeWelcomeWindow.bind(this);
  }

  componentDidMount () {
    if (this._mapview) {
      this._mapview.addEventListener('click:view', this._bound_mapOnClick);
    }
  }

  componentWillUnmount () {
    if (this._mapview) {
      this._mapview.removeEventListener('click:view', this._bound_mapOnClick);
    }
  }

  _rangeFilterOnChange (event) {
    console.info('filter changed', Date.now());

    const target = event.currentTarget;
    const {
      updateFilterValue,
      rangeMin,
      rangeMax,
    } = this.props;

    let newValue = parseInt(target.value, 10);
    newValue = isNaN(newValue) ? rangeMin : newValue;
    newValue = Math.max(rangeMin, newValue);
    newValue = Math.min(newValue, rangeMax);
    updateFilterValue(newValue);
  }

  _layerVisibilityOnChange (event) {
    const target = event.currentTarget;
    const layerIndex = parseInt(target.getAttribute('data-layer-index'), 10);
    const layerVisible = target.checked;
    const {
      toggleLayer,
    } = this.props;

    toggleLayer(layerIndex, layerVisible);
  }

  _layerOpacityOnChange (event) {
    const target = event.currentTarget;
    const layerIndex = parseInt(target.getAttribute('data-layer-index'), 10);
    const opacity = target.value / 255;
    const {
      updateLayerOpacity,
    } = this.props;

    updateLayerOpacity(layerIndex, opacity);
  }

  _yearStepBackButtonOnClick (/* event */) {
    const {
      rangeMin,
      filterValue,
      updateFilterValue,
    } = this.props;

    updateFilterValue(Math.max(rangeMin, filterValue - 1));
  }

  _yearStepForwardButtonOnClick (/* event */) {
    const {
      rangeMax,
      filterValue,
      updateFilterValue,
    } = this.props;

    updateFilterValue(Math.min(rangeMax, filterValue + 1));
  }

  _mapOnClick (event) {
    const {
      selectInspectPoint,
    } = this.props;

    selectInspectPoint(event.latLongCoordinate);
  }

  _closeWelcomeWindow(/* event */) {
    const {
      closeWelcomeWindow,
    } = this.props;

    closeWelcomeWindow();
  }

  render () {
    const {
      layers,

      inspectPointSelected,
      inspectPointCoordinate,

      filterValue,
      rangeMin,
      rangeMax,
      welcomeWindowClosed,
    } = this.props;

    return (
      <div className="page--workspace">

        {!welcomeWindowClosed ? (
          <div className="welcome_frame">
            <div className="welcome_background" />

            <div className="welcome_info">
              <h3>Model Run Metadata</h3>
              <button onClick={this._bound_closeWelcomeWindow}>Close</button>
              <p>This is the metadata of the layers.</p>
            </div>
          </div>
        ) : null}

        <div className="section-map">
          <div className="side-panel">

            <fieldset className="side-panel__section map-animation-controls">
              <div className="field--year">
                <label>Year: </label>
                <input
                  className="input-slider--year"
                  type="range"
                  min={rangeMin}
                  max={rangeMax}
                  step="1"
                  value={filterValue}
                  onChange={this._bound_rangeFilterOnChange}
                />
                <button
                  className="action--prev-year"
                  onClick={this._bound_yearStepBackButtonOnClick}
                >&lt;</button>
                <input
                  className="input--year"
                  type="text"
                  value={filterValue}
                  onChange={this._bound_rangeFilterOnChange}
                />
                <button
                  className="action--next-year"
                  onClick={this._bound_yearStepForwardButtonOnClick}
                >&gt;</button>
              </div>
            </fieldset>

            <fieldset className="side-panel__section layer-list">
              <legend>Layers</legend>
              {layers.map((layer, layerIndex) => (
                <div
                  key={layerIndex}
                  className="layer-list__item"
                >
                  <div className="layer-title-row">
                    <input
                      title="Toggle Visibility"
                      type="checkbox"
                      checked={!layer.invisible}
                      data-layer-index={layerIndex}
                      onChange={this._bound_layerVisibilityOnChange}
                    />
                    <label className="layer-title-label">{layer.name}</label>
                  </div>
                  <div className="layer-opacity-row">
                    <label>Opacity: </label>
                    <input
                      className="input-slider--layer-opacity"
                      type="range"
                      min="0"
                      max="255"
                      step="1"
                      value={layer.opacity * 255}
                      data-layer-index={layerIndex}
                      onChange={this._bound_layerOpacityOnChange}
                    />
                    <label>{layer.opacity.toFixed(2)}</label>
                  </div>
                </div>
              ))}
            </fieldset>

          </div>

          <map-view
            class="the-map"
            basemap="osm"
            center="-12107625, 4495720"
            zoom="5"
            ref={ref => this._mapview = ref}
          >

            {layers.map(o => o.element)}

            <map-layer-singlepoint
              invisible={!inspectPointSelected ? 'invisible' : null}
              latitude={inspectPointCoordinate[1]}
              longitude={inspectPointCoordinate[0]}
            />

            <map-control-defaults />
            <map-interaction-defaults />
            <map-control-simple-layer-list />

          </map-view>

          <Charts
            inspectPointSelected={inspectPointSelected}
            inspectPointCoordinate={inspectPointCoordinate}
          />

        </div>

      </div>
    );
  }
}
