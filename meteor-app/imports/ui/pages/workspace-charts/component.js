import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import Range from 'rc-slider/lib/Range';
import { clampFilterValue } from '/imports/ui/helper';

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
    updateFilter: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_rangeFilterOnChange = this._rangeFilterOnChange.bind(this);
    this._bound_rangeFilterMinOnChange = this._rangeFilterMinOnChange.bind(this);
    this._bound_rangeFilterMaxOnChange = this._rangeFilterMaxOnChange.bind(this);
    this._bound_yearMinStepBackButtonOnClick = this._yearMinStepBackButtonOnClick.bind(this);
    this._bound_yearMinStepForwardButtonOnClick = this._yearMinStepForwardButtonOnClick.bind(this);
    this._bound_yearMaxStepBackButtonOnClick = this._yearMaxStepBackButtonOnClick.bind(this);
    this._bound_yearMaxStepForwardButtonOnClick = this._yearMaxStepForwardButtonOnClick.bind(this);
  }

  _rangeFilterOnChange (values) {
    const {
      updateFilter,
      filterMin,
      filterMax,
      rangeMin,
      rangeMax,
    } = this.props;

    updateFilter(clampFilterValue(values[0], rangeMin, filterMax), clampFilterValue(values[1], filterMin, rangeMax));
  }

  _rangeFilterMinOnChange (event) {
    const target = event.currentTarget;
    const {
      filterMax,
    } = this.props;

    this._rangeFilterOnChange([target.value, filterMax]);
  }

  _rangeFilterMaxOnChange (event) {
    const target = event.currentTarget;
    const {
      filterMin,
    } = this.props;

    this._rangeFilterOnChange([filterMin, target.value]);
  }

  _yearMinStepBackButtonOnClick (/* event */) {
    const {
      filterMin,
      filterMax,
    } = this.props;

    this._rangeFilterOnChange([filterMin - 1, filterMax]);
  }

  _yearMinStepForwardButtonOnClick (/* event */) {
    const {
      filterMin,
      filterMax,
    } = this.props;

    this._rangeFilterOnChange([filterMin + 1, filterMax]);
  }

  _yearMaxStepBackButtonOnClick (/* event */) {
    const {
      filterMin,
      filterMax,
    } = this.props;

    this._rangeFilterOnChange([filterMin, filterMax - 1]);
  }

  _yearMaxStepForwardButtonOnClick (/* event */) {
    const {
      filterMin,
      filterMax,
    } = this.props;

    this._rangeFilterOnChange([filterMin, filterMax + 1]);
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
                <button onClick={this._bound_yearMinStepBackButtonOnClick}>&lt;</button>
                <input className="text-field" type="text" value={filterMin} onChange={this._bound_rangeFilterMinOnChange} />
                <button onClick={this._bound_yearMinStepForwardButtonOnClick}>&gt;</button>
                <Range
                  className="filter"
                  min={rangeMin}
                  max={rangeMax}
                  value={[filterMin, filterMax]}
                  onChange={this._bound_rangeFilterOnChange}
                />
                <button onClick={this._bound_yearMaxStepBackButtonOnClick}>&lt;</button>
                <input className="text-field" type="text" value={filterMax} onChange={this._bound_rangeFilterMaxOnChange} />
                <button onClick={this._bound_yearMaxStepForwardButtonOnClick}>&gt;</button>
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
