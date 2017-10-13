import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import Slider from 'material-ui/Slider';
import Charts from '/imports/ui/components/charts';
import {
  clampFilterValue,
} from '/imports/ui/helpers';
import { menu } from 'meteor/zodiase:mdc';

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

    // Callback functions for toggling the welcome window.
    toggleWelcomeWindow: PropTypes.func.isRequired,

    // Callback function for toggling side panel menu.
    toggleSideMenu: PropTypes.func.isRequired,

    // Callback funciton for toggling toolbar menu.
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
    if (this.target) {
      this.target.addEventListener('click', this._bound_toggleMenu);
    }
  }

  componentWillUnmount () {
    if (this._mapview) {
      this._mapview.removeEventListener('click:view', this._bound_mapOnClick);
    }

    if (this.target) {
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

  _layerOpacityOnChange (element, event, value) {
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

  _toggleWelcomeWindow() {
    this.props.toggleWelcomeWindow();
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

      titleName,

    } = this.props;

    return (
      <MuiThemeProvider muiTheme={customTheme}>
        <div className="page-workspace">

          <div className="section-map">

            <div className="side-panel">

              <Tabs
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
                  <div className="side-panel__section layer-list">
                    {layers.map((layer, layerIndex) => (
                      <Card
                        key={layerIndex}
                        className="layer-list__item"
                      >
                        <CardHeader
                          title={
                            <Checkbox
                              label={layer.name}
                              checked={!layer.invisible}
                              data-layer-index={layerIndex}
                              onCheck={this._bound_layerVisibilityOnChange}
                              style={{
                                'white-space': 'nowrap',
                              }}
                            />
                          }
                          showExpandableButton={true}
                        >
                        </CardHeader>
                        <CardText
                          expandable={true}
                        >
                          <div className="layer-opacity-row">
                            <label>Opacity: </label>
                            <Slider
                              className="input-slider--layer-opacity"
                              min={0}
                              max={255}
                              value={layer.opacity * 255}
                              data-layer-index={layerIndex}
                              onChange={this._bound_layerOpacityOnChange}
                              sliderStyle={{
                                'margin-top': 0,
                                'margin-bottom': 0,
                              }}
                            />
                            <label>{layer.opacity.toFixed(2)}</label>
                          </div>
                        </CardText>
                      </Card>
                    ))}
                  </div>
                </Tab>

                <Tab
                  label="Graphs"
                  data-slug="graphs"
                >
                  <div>
                    <h2>Graphs</h2>
                    <p>
                      This is the graphs tab.
                    </p>
                  </div>
                </Tab>

                <Tab
                  label="Metadata"
                  data-slug="metadata"
                >
                  <div>
                    <h2>Metadata</h2>
                    <p>
                      This is the metadata tab.
                    </p>
                  </div>
                </Tab>

              </Tabs>

            </div>

            <map-view
              class="the-map"
              basemap="osm"
              center="-12107625, 4495720"
              zoom="5"
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

            </map-view>

            <Charts
              inspectPointSelected={inspectPointSelected}
              inspectPointCoordinate={inspectPointCoordinate}
            />

          </div>

        </div>
      </MuiThemeProvider>
    );
  }
}
