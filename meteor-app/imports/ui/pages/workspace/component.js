import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { Bar } from "react-chartjs-2";

export default class Page_Workspace extends React.Component {
  constructor (props) {
    super(props);

    this._bound_rangeFilterOnChange = this._rangeFilterOnChange.bind(this);
  }

  _rangeFilterOnChange (event) {
    console.info('filter changed', Date.now());

    const target = event.currentTarget;
    const {
      updateFilterValue,
    } = this.props;

    updateFilterValue(target.value);
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
            <label>FilterValue: </label>
            <input
              className="layout_fill"
              type="range"
              min={filterMin}
              max={filterMax}
              step="1"
              value={filterValue}
              onChange={this._bound_rangeFilterOnChange}
            />
          </div>
        </fieldset>
        <div className="section_map">
          <map-view id="demo-map" basemap="osm" center="-10997148, 4569099" style={{width: "100%"}}>
            <map-layer-geojson
              name="example-geojson"
              src-json={JSON.stringify(data)}
              src-projection="EPSG:4326"
              projection="EPSG:3857"
            ></map-layer-geojson>
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
