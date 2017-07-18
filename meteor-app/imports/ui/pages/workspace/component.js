import React from 'react';
import PropTypes from 'prop-types';
import ifvisible from 'ifvisible.js';

let theWindow = null;

/**
 * Helper function to minimize a window.
 * @param {Window} w
 */
function Minimize (w) {
  // There's no way of truely minimizing the window.
  // The work-around here is to move it out of the screen.
  w.blur();
  w.resizeTo(0, 0);
  w.moveTo(screen.width, screen.height);
}

/**
 * Helper function to restore a minimized window.
 * @param {Window} w
 */
function RestoreMinimized(w) {
  const { width, height, x, y } = w._minimizeRestore;
  w.moveTo(x, y);
  w.resizeTo(width, height);
  w.focus();
}

function openWindow(coord) {
  if (theWindow) {
    theWindow.close();
  }

  theWindow = window.open(`/workspace/charts?longitude=${coord[0]}&latitude=${coord[1]}`, '_blank', 'height=600,width=800,menubar=no,status=no,titlebar=no');

  theWindow.onfocus = () => {
    RestoreMinimized(theWindow);
  };

  theWindow._minimizeRestore = {
    width: theWindow.outerWidth,
    height: theWindow.outerHeight,
    x: theWindow.screenX,
    y: theWindow.screenY,
  };
}

ifvisible.on('blur', function () {
  if (theWindow) {
    Minimize(theWindow);
  }
});

// Close all child windows when the parent window closes.
window.onbeforeunload = () => {
  if (theWindow) {
    theWindow.close();
    theWindow = null;
  }
};

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

    rangeMin: PropTypes.number.isRequired,
    rangeMax: PropTypes.number.isRequired,

    // Callback function for updating filter value.
    updateFilterValue: PropTypes.func.isRequired,

    welcomeWindowClosed: PropTypes.bool.isRequired,
    closeWelcomeWindow: PropTypes.func.isRequired,
    layerOpacity: PropTypes.number.isRequired,
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

  _rangeFilterOnChange (event) {
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
    const opacity = target.value / 255;
    const {
      updateLayerOpacity,
    } = this.props;

    updateLayerOpacity(opacity);
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
    openWindow(event.latLongCoordinate);
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
      layerOpacity,
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

        <div className="section_filter">
          <div className="filter-row">
            <label>Year: </label>
            <input
              className="layout_fill"
              type="range"
              min={rangeMin}
              max={rangeMax}
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
                  <input title="Toggle Visibility" type="radio" checked={!layer.invisible} data-layer-index={layerIndex} onChange={this._bound_layerVisibilityOnChange} />
                  <label>{layer.name}</label>
                </div>
              </li>
            ))}
            <div>
              <label>Opacity:</label>
              <input type="range" min="0" max="255" step="1" value={layerOpacity * 255} onChange={this._bound_layerOpacityOnChange} />
              <label>{layerOpacity.toFixed(2)}</label>
            </div>
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
                <map-layer-twms
                  url={layer.url}
                  min-zoom={layer.minZoom}
                  max-zoom={layer.maxZoom}
                  invisible={layer.invisible ? 'invisible' : null}
                  opacity={layerOpacity}
                  extent={layer.extent}
                  params={`LAYERS=${layer.name}${filterValue}&TILED=true`}
                  server-type="geoserver"
                />
                {!layer.nextUrl ? null : (
                  <map-layer-xyz
                    name={`${layer.name} (preload)`}
                    url={layer.nextUrl}
                    min-zoom={layer.minZoom}
                    max-zoom={layer.maxZoom}
                    opacity={layerOpacity}
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
