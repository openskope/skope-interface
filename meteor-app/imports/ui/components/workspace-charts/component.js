import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import {
  Toolbar,
  ToolbarGroup,
} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import CircularProgress from 'material-ui/CircularProgress';
import { Line } from 'react-chartjs-2';
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';
import {
  clampFilterValue,
  getClassName,
} from '/imports/ui/helpers';

export default class ChartsPage extends React.Component {

  static propTypes = {
    dataSectionClassName: PropTypes.string.isRequired,

    // Indicate if the data is being loaded for the point.
    dataIsLoading: PropTypes.bool.isRequired,
    // Indicate if any data is loaded.
    hasLoadedData: PropTypes.bool.isRequired,
    // The loaded data for the point.
    sources: PropTypes.arrayOf(PropTypes.object),

    // The current value of the range filters
    filterMin: PropTypes.number.isRequired,
    filterMax: PropTypes.number.isRequired,

    // The range of the range filters
    rangeMin: PropTypes.number.isRequired,
    rangeMax: PropTypes.number.isRequired,

    // Callback function for updating filter values
    updateFilter: PropTypes.func.isRequired,
  };

  static styles = {
    toolbarStyle: {
      height: 38,
      overflow: 'hidden',
    },
    toolbarButtonStyle: {
      height: 30,
      width: 30,
      padding: 30 / 6,
    },
    toolbarButtonIconStyle: {
      height: 30 * (2 / 3),
      width: 30 * (2 / 3),
    },
    toolbarSliderStyle: {
      marginLeft: 10,
      marginRight: 10,
      flex: '1 1 0',
    },
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

  _renderChartsWithData () {
    const {
      dataSectionClassName,
      sources,
      filterMin,
      filterMax,
      rangeMin,
      rangeMax,
    } = this.props;

    return (
      <div className="section_charts">

        <Toolbar
          style={this.constructor.styles.toolbarStyle}
        >
          <ToolbarGroup
            firstChild
            lastChild
            style={{
              flex: '1 1 0',
            }}
          >
            <IconButton
              style={this.constructor.styles.toolbarButtonStyle}
              iconStyle={this.constructor.styles.toolbarButtonIconStyle}
              onClick={this._bound_yearMinStepBackButtonOnClick}
            ><LeftArrowIcon /></IconButton>

            <TextField
              hintText="FilterMin"
              type="text"
              style={{
                width: 40,
                flex: '0 0 auto',
              }}
              inputStyle={{
                textAlign: 'center',
              }}
              value={filterMin}
              onChange={this._bound_rangeFilterMinOnChange}
            />

            <IconButton
              style={this.constructor.styles.toolbarButtonStyle}
              iconStyle={this.constructor.styles.toolbarButtonIconStyle}
              onClick={this._bound_yearMinStepForwardButtonOnClick}
            ><RightArrowIcon /></IconButton>

            <Range
              min={rangeMin}
              max={rangeMax}
              value={[filterMin, filterMax]}
              onChange={this._bound_rangeFilterOnChange}
              style={this.constructor.styles.toolbarSliderStyle}
            />

            <IconButton
              style={this.constructor.styles.toolbarButtonStyle}
              iconStyle={this.constructor.styles.toolbarButtonIconStyle}
              onClick={this._bound_yearMaxStepBackButtonOnClick}
            ><LeftArrowIcon /></IconButton>

            <TextField
              hintText="FilterMax"
              type="text"
              style={{
                width: 40,
                flex: '0 0 auto',
              }}
              inputStyle={{
                textAlign: 'center',
              }}
              value={filterMax}
              onChange={this._bound_rangeFilterMaxOnChange}
            />

            <IconButton
              style={this.constructor.styles.toolbarButtonStyle}
              iconStyle={this.constructor.styles.toolbarButtonIconStyle}
              onClick={this._bound_yearMaxStepForwardButtonOnClick}
            ><RightArrowIcon /></IconButton>
          </ToolbarGroup>
        </Toolbar>

        <div
          className={getClassName(
            'section_data',
            dataSectionClassName,
          )}
        >
          { sources.map(({ label, data }, dataIndex) => (
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
    );
  }

  _renderViewWithoutData () {
    const {
      dataSectionClassName,
    } = this.props;

    return (
      <div
        className={getClassName(
          dataSectionClassName,
        )}
      >
        <p>Select a point on the map to view the data.</p>
      </div>
    );
  }

  _renderLoadingSign () {
    const {
      dataSectionClassName,
    } = this.props;

    return (
      <div
        className={getClassName(
          dataSectionClassName,
        )}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 100,
        }}
      >
        <CircularProgress color="blue" />
      </div>
    );
  }

  render () {
    const {
      dataIsLoading,
      hasLoadedData,
    } = this.props;

    return (
      <MuiThemeProvider muiTheme={customTheme}>
        <div className="workspace-charts">
          {
            dataIsLoading
            ? this._renderLoadingSign()
            : (
              !hasLoadedData
              ? this._renderViewWithoutData()
              : this._renderChartsWithData()
            )
          }
        </div>
      </MuiThemeProvider>
    );
  }
}
