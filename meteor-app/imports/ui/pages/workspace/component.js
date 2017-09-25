import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider/lib/Slider';
import _ from 'lodash';
import Charts from '/imports/ui/components/charts/container';
import { clampFilterValue } from '/imports/ui/helper';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

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
    putFilterValueInUrl: PropTypes.func.isRequired,

    // The state of the welcome window.
    welcomeWindowClosed: PropTypes.bool.isRequired,
    // Callback functions for toggling the welcome window.
    toggleWelcomeWindow: PropTypes.func.isRequired,

    //Callback function for toggling side panel menu.
    toggleSideMenu: PropTypes.func.isRequired,

    //The state of toolbar menu.
    toolbarMenuClosed: PropTypes.bool.isRequired,
    //Callback funciton for toggling toolbar menu.
    toggleToolbarMenu: PropTypes.func.isRequired,

  };

  constructor (props) {
    super(props);

    this._bound_rangeFilterOnChange = _.debounce(this._rangeFilterOnChange.bind(this), 0);
    this._bound_rangeFilterOnChangeInput = this._rangeFilterOnChangeInput.bind(this);
    this._bound_yearStepBackButtonOnClick = this._yearStepBackButtonOnClick.bind(this);
    this._bound_yearStepForwardButtonOnClick = this._yearStepForwardButtonOnClick.bind(this);
    this._bound_layerVisibilityOnChange = this._layerVisibilityOnChange.bind(this);
    this._bound_layerOpacityOnChange = this._relayContext(this._layerOpacityOnChange.bind(this));
    this._bound_mapOnClick = this._mapOnClick.bind(this);
    this._bound_toggleWelcomeWindow = this._toggleWelcomeWindow.bind(this);
    this._bound_toggleSideMenu = this._toggleSideMenu.bind(this);
    this._bound_toggleToolbarMenu = this._toggleToolbarMenu.bind(this);

  }

  componentDidMount () {
    if (this._mapview) {
      this._mapview.addEventListener('click:view', this._bound_mapOnClick);
    }
    if(this.target) {
      this.target.addEventListener('click', this._bound_toggleMenu);
    }
  }

  componentWillUnmount () {
    if (this._mapview) {
      this._mapview.removeEventListener('click:view', this._bound_mapOnClick);
    }

    if(this.target) {
      this.target.removeEventListener('click', this._bound_toggleMenu);
    }
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
    console.info('filter changed', Date.now());

    const {
      rangeMin,
      rangeMax,
    } = this.props;

    this._updateFilterValue(clampFilterValue(value, rangeMin, rangeMax));
  }

  _rangeFilterOnChangeInput (event) {
    this._rangeFilterOnChange(event.target.value);
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

  _layerOpacityOnChange (element, value) {
    const opacity = value / 255;
    const {
      updateLayerOpacity,
    } = this.props;

    updateLayerOpacity(element['data-layer-index'], opacity);
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

  _mapOnClick (event) {
    const {
      selectInspectPoint,
    } = this.props;

    selectInspectPoint(event.latLongCoordinate);
  }

  _toggleWelcomeWindow(/* event */) {
    const {
      toggleWelcomeWindow,
    } = this.props;

    toggleWelcomeWindow();
  }

    _relayContext = (func) => {
        return function (...args) {
            return func(this, ...args);
        };
    };

  _toggleSideMenu(event) {
    const target = event.currentTarget;
    const layerIndex = parseInt(target.getAttribute('data-layer-index'), 10);
    const menuInvisible = target.checked;
    const {
      toggleSideMenu,
    } = this.props;

    toggleSideMenu(layerIndex, menuInvisible);
  }

  _toggleToolbarMenu() {
    const {
      toggleToolbarMenu,
    } = this.props;

    toggleToolbarMenu();
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
      toolbarMenuClosed,

      titleName,

    } = this.props;

    return (
      <div className="page--workspace">




        <div className="section-map">


          <div className="side-panel">

            <div className="mdc-toolbar">
              <div className="mdc-toolbar__row">
                <section className="mdc-toolbar__section mdc-toolbar__section--align-start">
                  <span className="mdc-toolbar__title">{titleName}</span>
                </section>
                <section className="mdc-toolbar__section mdc-toolbar__section--align-end">
                  <div className="mdc-menu-anchor">
                    <a className="material-icons mdc-toolbar__icon--menu">more_vert</a>

                    <div className="mdc-simple-menu" tabIndex={-1}>
                      <ul className="mdc-simple-menu__items mdc-list" role="menu" aria-hidden={true}>
                        <li className="mdc-list-item list-metadata"
                            role="menuitem"
                            tabIndex={0}>
                          Metadata
                          <a className="material-icons mdc-list-item__end-detail">keyboard_arrow_right</a>
                        </li>

                        <a href={FlowRouter.url('/workspace/help')}>
                          <li className="mdc-list-item" role="menuitem" tabIndex={0}>
                            Help<span className="material-icons mdc-list-item__end-detail">keyboard_arrow_right</span>
                          </li>
                        </a>
                      </ul>
                    </div>
                  </div>

                  <div className="menu-info-content">
                    <h3>Metadata</h3>
                  </div>


                  <div className="media-large-size">
                    <div className="toolbar--dropdown">
                      <div className="dropdown-1"
                           onClick={this._bound_toggleWelcomeWindow}>
                        <a className="material-icons mdc-toolbar__icon--menu">info
                          <span className="tooltip-text">INFO</span>
                        </a>
                      </div>

                      {welcomeWindowClosed ? null : (
                        <div className="info-content">
                          <h3>Metadata</h3>
                          <div className="mdc-list-divider"></div>
                        </div>)}

                      <div className="dropdown-2">
                        <a className="material-icons mdc-toolbar__icon--menu" href={FlowRouter.url('/workspace/help')}>help
                          <span className="tooltip-text">HELP</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="side-panel__content">
              <div className="side-panel__section map-animation-controls">

                <legend>TIME</legend>
                <div className="field--year">
                  <div className="field--year-row1">
                    <a className="material-icons action--prev-year"
                       onClick={this._bound_yearStepBackButtonOnClick}
                    >keyboard_arrow_left</a>
                    <input
                      className="input--year"
                      type="text"
                      value={filterValue}
                      onChange={this._bound_rangeFilterOnChangeInput}
                    />
                    <a className="material-icons action--next-year"
                       onClick={this._bound_yearStepForwardButtonOnClick}
                    >keyboard_arrow_right</a>
                  </div>
                  <div className="label-year">Year</div>
                </div>
                <div className="field--year-row2">
                  <Slider
                    className="input-slider--year"
                    min={rangeMin}
                    max={rangeMax}
                    value={filterValue}
                    onChange={this._bound_rangeFilterOnChange}
                  />
                </div>
              </div>

              <div className="side-panel__section layer-list">
                <legend>LAYERS</legend>
                {layers.map((layer, layerIndex) => (
                  <div
                    key={layerIndex}
                    className="layer-list__item layer-list__item--opacity-control-expand"
                  >
                    <div className="layer-title-row">
                      <div className="mdc-checkbox">
                        <input
                          className="mdc-checkbox__native-control"
                          title="Toggle Visibility"
                          type="checkbox"
                          checked={!layer.invisible}
                          data-layer-index={layerIndex}
                          onChange={this._bound_layerVisibilityOnChange}
                        />
                        <div className="mdc-checkbox__background">
                          <svg className="mdc-checkbox__checkmark"
                               viewBox="0 0 24 24">
                            <path className="mdc-checkbox__checkmark__path"
                                  fill="none"
                                  stroke="white"
                                  d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                          </svg>
                          <div className="mdc-checkbox__mixedmark"></div>
                        </div>
                      </div>

                      <label className="layer-title-label">{layer.name}</label>

                      <a className="material-icons mdc-list-item__end-detail"
                         data-layer-index={layerIndex}
                         onClick={this._bound_toggleSideMenu}>
                        keyboard_arrow_down</a>

                    </div>

                    {layer.sidePanelMenuClosed ? null : (
                      <div className="layer-opacity-row">
                        <label>Opacity: </label>
                        <Slider
                          className="input-slider--layer-opacity"
                          min={0}
                          max={255}
                          value={layer.opacity * 255}
                          data-layer-index={layerIndex}
                          onChange={this._bound_layerOpacityOnChange}
                        />
                        <label>{layer.opacity.toFixed(2)}</label>
                      </div>
                    )}

                    <div className="mdc-list-divider"></div>
                  </div>
                ))}
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
