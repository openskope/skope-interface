import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';

export default class ChartsPage extends React.Component {

  static propTypes = {
    // Indicate if the data is being loaded for the point.
    inspectPointLoading: PropTypes.bool.isRequired,
    // The loaded data for the point.
    inspectPointData: PropTypes.arrayOf(PropTypes.object),

    // The current value of the range filters
    filterMin: PropTypes.number.isRequired,
    filterMax: PropTypes.number.isRequired,

    // The range of the range filters
    rangeMin: PropTypes.number.isRequired,
    rangeMax: PropTypes.number.isRequired,

    // Callback function for updating filter values
    updateFilterMin: PropTypes.func.isRequired,
    updateFilterMax: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_rangeFilterMinOnChange = this._rangeFilterMinOnChange.bind(this);
    this._bound_rangeFilterMaxOnChange = this._rangeFilterMaxOnChange.bind(this);
    this._bound_yearMinStepBackButtonOnClick = this._yearMinStepBackButtonOnClick.bind(this);
    this._bound_yearMinStepForwardButtonOnClick = this._yearMinStepForwardButtonOnClick.bind(this);
    this._bound_yearMaxStepBackButtonOnClick = this._yearMaxStepBackButtonOnClick.bind(this);
    this._bound_yearMaxStepForwardButtonOnClick = this._yearMaxStepForwardButtonOnClick.bind(this);
  }

  _rangeFilterMinOnChange (event) {
    const target = event.currentTarget;
    const {
      updateFilterMin,
      rangeMin,
      filterMax,
    } = this.props;

    let newValue = parseInt(target.value, 10);
    newValue = isNaN(newValue) ? rangeMin : newValue;
    newValue = Math.max(rangeMin, newValue);
    newValue = Math.min(newValue, filterMax);
    updateFilterMin(newValue);
  }

  _rangeFilterMaxOnChange (event) {
    const target = event.currentTarget;
    const {
      updateFilterMax,
      filterMin,
      rangeMax,
    } = this.props;

    let newValue = parseInt(target.value, 10);
    newValue = isNaN(newValue) ? filterMin : newValue;
    newValue = Math.max(filterMin, newValue);
    newValue = Math.min(newValue, rangeMax);
    updateFilterMax(newValue);
  }

  _yearMinStepBackButtonOnClick (/* event */) {
    const {
      filterMin,
      rangeMin,
      updateFilterMin,
    } = this.props;

    updateFilterMin(Math.max(filterMin - 1, rangeMin));
  }

  _yearMinStepForwardButtonOnClick (/* event */) {
    const {
      filterMin,
      filterMax,
      updateFilterMin,
    } = this.props;

    updateFilterMin(Math.min(filterMin + 1, filterMax));
  }

  _yearMaxStepBackButtonOnClick (/* event */) {
    const {
      filterMax,
      filterMin,
      updateFilterMax,
    } = this.props;

    updateFilterMax(Math.max(filterMax - 1, filterMin));
  }

  _yearMaxStepForwardButtonOnClick (/* event */) {
    const {
      filterMax,
      rangeMax,
      updateFilterMax,
    } = this.props;

    updateFilterMax(Math.min(filterMax + 1, rangeMax));
  }

  render () {
    const {
      inspectPointLoading,
      inspectPointData,

      filterMin,
      filterMax,
      rangeMin,
      rangeMax,
    } = this.props;

    return (
      <div className="page--charts">
        {
          inspectPointLoading
          ? (
            <div className="loading">
              <span>Loading...</span>
            </div>
            )
          : (
            <div className="section_charts">

              <div className="section_range">
                <div className="filter-min">
                  <label>Start: </label>
                  <input
                    className="layout_fill"
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    step="1"
                    value={filterMin}
                    onChange={this._bound_rangeFilterMinOnChange}
                  />
                  <button onClick={this._bound_yearMinStepBackButtonOnClick}>&lt;</button>
                  <input className="text-field" type="text" value={filterMin} onChange={this._bound_rangeFilterMinOnChange} />
                  <button onClick={this._bound_yearMinStepForwardButtonOnClick}>&gt;</button>
                </div>
                <div className="filter-max">
                  <label>End: </label>
                  <input
                    className="layout_fill"
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    step="1"
                    value={filterMax}
                    onChange={this._bound_rangeFilterMaxOnChange}
                  />
                  <button onClick={this._bound_yearMaxStepBackButtonOnClick}>&lt;</button>
                  <input className="text-field" type="text" value={filterMax} onChange={this._bound_rangeFilterMaxOnChange} />
                  <button onClick={this._bound_yearMaxStepForwardButtonOnClick}>&gt;</button>
                </div>
              </div>

              <div className="section_data">
                { inspectPointData.map(({ label, data }, dataIndex) => (
                  <div
                    key={dataIndex}
                    style={{ height: '200px' }}
                  >
                    <Line
                      data={{
                        datasets: [
                          {
                            label,
                            lineTension: 0,
                            pointRadius: 0,
                            backgroundColor: 'rgba(255,99,132,0.2)',
                            borderColor: 'rgba(255,99,132,1)',
                            borderWidth: 1,
                            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                            hoverBorderColor: 'rgba(255,99,132,1)',
                            data,
                          },
                        ],
                      }}
                      options={{
                        animation: {
                          duration: 0,
                        },
                        maintainAspectRatio: false,
                        tooltips: {
                          enabled: true,
                          mode: 'nearest',
                          intersect: false,
                        },
                        hover: {
                          mode: 'nearest',
                          intersect: false,
                          animationDuration: 0,
                        },
                        scales: {
                          xAxes: [
                            {
                              type: 'linear',
                              position: 'bottom',
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
            </div>
          )
        }
      </div>
    );
  }
}
