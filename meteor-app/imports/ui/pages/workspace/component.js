import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";

export default class Page_Workspace extends React.Component {

  static propTypes = {
    // Indicate if all data needed by this component is ready.
    dataReady: PropTypes.bool.isRequired,
    // The feature collection for the vector layer.
    data: PropTypes.object.isRequired,
    // Lower bound of the filter slider.
    filterMin: PropTypes.number.isRequired,
    // Upper bound of the filter slider.
    filterMax: PropTypes.number.isRequired,
    // Current value of the filter slider.
    filterValue: PropTypes.number.isRequired,
    // Array of histogram data for the charts.
    channelDistributions: PropTypes.array,
    // Callback function for updating filter value.
    updateFilterValue: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_rangeFilterOnChange = this._rangeFilterOnChange.bind(this);
    this._bound_yearStepBackButtonOnClick = this._yearStepBackButtonOnClick.bind(this);
    this._bound_yearStepForwardButtonOnClick = this._yearStepForwardButtonOnClick.bind(this);
  }

  _rangeFilterOnChange (event) {
    console.info('filter changed', Date.now());

    const target = event.currentTarget;
    const {
      updateFilterValue,
    } = this.props;

    updateFilterValue(target.value);
  }

  _yearStepBackButtonOnClick (/*event*/) {
    const {
      filterMin,
      filterValue,
      updateFilterValue,
    } = this.props;

    updateFilterValue(Math.max(filterMin, filterValue - 1));
  }

  _yearStepForwardButtonOnClick (/*event*/) {
    const {
      filterMax,
      filterValue,
      updateFilterValue,
    } = this.props;

    updateFilterValue(Math.min(filterMax, filterValue + 1));
  }

  render () {
    const {
      dataReady,
      data,
      filterMin,
      filterMax,
      filterValue,
      channelDistributions,
    } = this.props;

    return (
      <div className="page--workspace">
        <fieldset className="section_filter" disabled={!dataReady}>
          <legend>Filters</legend>
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
        </fieldset>
        <div className="section_map">
          <map-view
            id="demo-map"
            basemap="osm"
            center="-12107625, 4495720"
            zoom="5"
            style={{
              width: "100%",
              height: "400px",
            }}
          >
            <map-layer-geojson
              name="example-geojson"
              src-json={JSON.stringify(data)}
              src-projection="EPSG:4326"
              projection="EPSG:3857"
              invisible={true}
            ></map-layer-geojson>

            {(filterMin < filterValue) ? (
              <map-layer-xyz
                name="testing-skope-preload-prev"
                url={`http://demo.openskope.org/static_tiles/PPT_water_year/tiles/PPT_water_year-${filterValue - 1}-color/{z}/{x}/{-y}.png`}
                min-zoom="5"
                max-zoom="12"
                opacity="0.7"
                extent="-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904"
                invisible={true}
              ></map-layer-xyz>
            ) : null}

            <map-layer-xyz
              name="testing-skope"
              url={`http://demo.openskope.org/static_tiles/PPT_water_year/tiles/PPT_water_year-${filterValue}-color/{z}/{x}/{-y}.png`}
              min-zoom="5"
              max-zoom="12"
              opacity="0.7"
              extent="-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904"
            ></map-layer-xyz>

            {(filterMax > filterValue) ? (
              <map-layer-xyz
                name="testing-skope-preload-next"
                url={`http://demo.openskope.org/static_tiles/PPT_water_year/tiles/PPT_water_year-${filterValue + 1}-color/{z}/{x}/{-y}.png`}
                min-zoom="5"
                max-zoom="12"
                opacity="0.7"
                extent="-12856096.661340367, 3620057.6595859504, -11359153.899403473, 5371382.851655904"
                invisible={true}
              ></map-layer-xyz>
            ) : null}

            <map-control-defaults></map-control-defaults>
            <map-interaction-defaults></map-interaction-defaults>
            <map-control-simple-layer-list></map-control-simple-layer-list>
          </map-view>
        </div>
        <div className="section_charts">
          {
            dataReady
            ? <div>
                {channelDistributions.map((distData, index) => (
                  <div
                    key={index}
                    style={{height: "200px"}}
                  >
                    <Bar

                      data={{
                        labels: distData.map((count, index) => index),
                        datasets: [
                          {
                            label: `channel ${index}`,
                            backgroundColor: 'rgba(255,99,132,0.2)',
                            borderColor: 'rgba(255,99,132,1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                            hoverBorderColor: 'rgba(255,99,132,1)',
                            data: distData,
                          },
                        ],
                      }}
                      options={{
                        animation: {
                          duration: 0,
                        },
                        maintainAspectRatio: false,
                        scales: {
                          xAxes: [
                            {
                              type: "category",
                              position: "bottom",
                              ticks: {
                                autoSkip: true,
                                autoSkipPadding: 8,
                              },
                            },
                          ],
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            : <div>
                <span>Loading...</span>
              </div>
          }
        </div>
      </div>
    );
  }
}
