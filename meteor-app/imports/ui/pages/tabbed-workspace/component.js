import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import {
  Tabs,
  Tab,
} from 'material-ui/Tabs';
import LayerList from '/imports/ui/components/layerlist';
import Charts from '/imports/ui/components/charts';
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

    this._bound_rangeFilterOnChange = _.debounce(this._rangeFilterOnChange.bind(this), 0);
    this._bound_rangeFilterOnChangeInput = this._rangeFilterOnChangeInput.bind(this);
    this._bound_yearStepBackButtonOnClick = this._yearStepBackButtonOnClick.bind(this);
    this._bound_yearStepForwardButtonOnClick = this._yearStepForwardButtonOnClick.bind(this);
    this._bound_mapOnClick = this._mapOnClick.bind(this);
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

  _relayContext = (func) => {
    return function (...args) {
      return func(this, ...args);
    };
  };

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
                  <LayerList
                    className="side-panel__section"
                    layers={layers}
                  />
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
