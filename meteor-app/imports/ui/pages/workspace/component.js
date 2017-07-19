import React from 'react';
import PropTypes from 'prop-types';

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

    // Lower bound of the filter slider.
    filterMin: PropTypes.number.isRequired,
    // Upper bound of the filter slider.
    filterMax: PropTypes.number.isRequired,
    // Current value of the filter slider.
    filterValue: PropTypes.number.isRequired,
    // Callback function for updating filter value.
    updateFilterValue: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_rangeFilterOnChange = this._rangeFilterOnChange.bind(this);
    this._bound_yearStepBackButtonOnClick = this._yearStepBackButtonOnClick.bind(this);
    this._bound_yearStepForwardButtonOnClick = this._yearStepForwardButtonOnClick.bind(this);
    this._bound_layerVisibilityOnChange = this._layerVisibilityOnChange.bind(this);
    this._bound_layerOpacityOnChange = this._layerOpacityOnChange.bind(this);
    this._bound_mapOnClick = this._mapOnClick.bind(this);
  }

  componentDidMount () {
    if (this._mapview) {
      this._mapview.addEventListener('click:view', this._bound_mapOnClick);
    }
  }

  _rangeFilterOnChange (event) {
    console.info('filter changed', Date.now());

    const target = event.currentTarget;
    const {
      updateFilterValue,
    } = this.props;

    updateFilterValue(target.value);
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
      filterMin,
      filterValue,
      updateFilterValue,
    } = this.props;

    updateFilterValue(Math.max(filterMin, filterValue - 1));
  }

  _yearStepForwardButtonOnClick (/* event */) {
    const {
      filterMax,
      filterValue,
      updateFilterValue,
    } = this.props;

    updateFilterValue(Math.min(filterMax, filterValue + 1));
  }

  _mapOnClick (event) {
    const {
      selectInspectPoint,
    } = this.props;

    selectInspectPoint(event.latLongCoordinate);
  }

  render () {
    const {
      layers,

      inspectPointSelected,
      inspectPointCoordinate,

      filterMin,
      filterMax,
      filterValue,
    } = this.props;

    return (
      <div className="page--workspace">
        <div className="section_filter">
          <div className="filter-row">
            <label>Year: </label>
            <input
              className="layout_fill"
              type="range"
              min={filterMin}
              max={filterMax}
              step="1"
              value={filterValue}
              onChange={this._bound_rangeFilterOnChange}
            />
            <button onClick={this._bound_yearStepBackButtonOnClick}>&lt;</button>
            <label>{filterValue}</label>
            <button onClick={this._bound_yearStepForwardButtonOnClick}>&gt;</button>
          </div>
          <ul className="layer-list">
            <p>Layer list:</p>
            {layers.map((layer, layerIndex) => (
              <li key={layerIndex}>
                <div>
                  <input title="Toggle Visibility" type="checkbox" checked={!layer.invisible} data-layer-index={layerIndex} onChange={this._bound_layerVisibilityOnChange} />
                  <label>{layer.name}</label>
                </div>
                <div>
                  <label>Opacity: </label>
                  <input type="range" min="0" max="255" step="1" value={layer.opacity * 255} data-layer-index={layerIndex} onChange={this._bound_layerOpacityOnChange} />
                  <label>{layer.opacity.toFixed(2)}</label>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="section_map">
          <map-view
            class="the-map"
            basemap="osm"
            center="-12107625, 4495720"
            zoom="5"
            ref={ref => this._mapview = ref}
          >
            {layers.map((layer, layerIndex) => (
              <map-layer-group
                key={layerIndex}
              >
                <map-layer-xyz
                  name={layer.name}
                  url={layer.url}
                  min-zoom={layer.minZoom}
                  max-zoom={layer.maxZoom}
                  invisible={layer.invisible ? 'invisible' : null}
                  opacity={layer.opacity}
                  extent={layer.extent}
                />
                {!layer.nextUrl ? null : (
                  <map-layer-xyz
                    name={`${layer.name} (preload)`}
                    url={layer.nextUrl}
                    min-zoom={layer.minZoom}
                    max-zoom={layer.maxZoom}
                    opacity="0"
                    extent={layer.extent}
                  />
                )}
              </map-layer-group>
            ))}

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
