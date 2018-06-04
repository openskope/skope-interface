import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import objectPath from 'object-path';
import c3 from 'c3';
import 'c3/c3.css';
import Toggle from 'material-ui/Toggle';

import {
  dataChartShowUncertantyByDefault,
} from '/imports/ui/consts';

import {
  getPrecisionByResolution,
  offsetDateAtPrecision,
  makeSVGDocAsync,
  svgDocToBlob,
} from '/imports/ui/helpers';

export default
class AnalyticsChart extends React.Component {
  static propTypes = {
    variableName: PropTypes.string.isRequired,
    temporalResolution: PropTypes.string.isRequired,
    temporalPeriod: PropTypes.shape({
      gte: PropTypes.instanceOf(Date),
      lte: PropTypes.instanceOf(Date),
    }).isRequired,
    data: PropTypes.shape({
      datasetId: PropTypes.string,
      variableName: PropTypes.string,
      range: PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
      }),
      values: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,
    onRenderStart: PropTypes.func,
    onRenderEnd: PropTypes.func,
  };

  static defaultProps = {
    onRenderStart: () => {},
    onRenderEnd: () => {},
  };

  static timeFormatsForC3 = [
    '%Y',
    '%Y-%m',
    '%Y-%m-%d',
    '%Y-%m-%d %H',
    '%Y-%m-%d %H:%M',
    '%Y-%m-%d %H:%M:%S',
  ];

  constructor (props) {
    super(props);

    this.state = {
      displayDataUncertaintyValues: dataChartShowUncertantyByDefault,
    };
  }

  componentDidMount () {
    this.renderChart();
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !(_.isEqual(nextProps, this.props) && _.isEqual(nextState, this.state));
  }

  componentDidUpdate () {
    this.renderChart();
  }

  onToggleDataUncertainty = () => {
    this.setState({
      displayDataUncertaintyValues: !this.state.displayDataUncertaintyValues,
    });
  };

  get dataUncertaintyValues () {
    const {
      data,
    } = this.props;

    const lowerBounds = objectPath.get(data, 'lowerBounds', null);
    const upperBounds = objectPath.get(data, 'upperBounds', null);

    if (!(lowerBounds && upperBounds)) {
      return null;
    }

    return [
      lowerBounds,
      upperBounds,
    ];
  }

  toBlob = async () => {
    const svgElement = this._chartContainer.querySelector('svg');

    if (!svgElement) {
      return null;
    }

    const svgDoc = await makeSVGDocAsync(svgElement);

    return svgDocToBlob(svgDoc);
  };

  renderChart () {
    if (!this._chartContainer) {
      return;
    }

    this.props.onRenderStart();

    const {
      variableName,
      temporalResolution,
      temporalPeriod,
      data,
    } = this.props;
    const {
      displayDataUncertaintyValues,
    } = this.state;

    const temporalPrecision = getPrecisionByResolution(temporalResolution);
    const startDate = new Date(temporalPeriod.gte);
    const xAxisFormat = AnalyticsChart.timeFormatsForC3[temporalPrecision];
    const xAxisLabelBaseIndex = objectPath.get(data, 'range.start', 0);
    const dataValues = objectPath.get(data, 'values', []);
    const dataUncertaintyValues = this.dataUncertaintyValues;
    const dataLabel = variableName === null ? objectPath.get(data, 'variableName', '') : variableName;
    const xAxisLabels = dataValues.map((v, index) => {
      const date = offsetDateAtPrecision(startDate, temporalPrecision, xAxisLabelBaseIndex + index);

      return date;
    });

    const chartDataColumns = [
      ['x', ...xAxisLabels],
    ];

    if (dataUncertaintyValues && displayDataUncertaintyValues) {
      chartDataColumns.push(['range +', ...dataUncertaintyValues[1]]);
      chartDataColumns.push(['value', ...dataValues]);
      chartDataColumns.push(['range -', ...dataUncertaintyValues[0]]);
    } else {
      chartDataColumns.push(['value', ...dataValues]);
    }

    // Number in pixels.
    const XTickSize = 60;
    const xTickCount = Math.floor(this._chartContainer.clientWidth / XTickSize);

    this._chart = c3.generate({
      bindto: this._chartContainer,
      data: {
        x: 'x',
        // xFormat: '%Y-%m', // 'xFormat' can be used as custom format of 'x'
        // xFormat: xAxisFormat,
        columns: chartDataColumns,
        types: {
          'range +': 'area',
          'range -': 'area',
        },
        colors: {
          'range +': '#CCCCCC',
          'range -': '#FFFFFF',
        },
      },
      area: {
        zerobased: false,
      },
      axis: {
        y: {
          label: {
            text: dataLabel,
            position: 'outer-middle',
          },
        },
        x: {
          type: 'timeseries',
          label: {
            text: `Date (${temporalResolution})`,
            position: 'outer-center',
          },
          tick: {
            format: xAxisFormat,
            values: (xRange) => {
              // @type {number}
              const minX = xRange[0].valueOf();
              // @type {number}
              const maxX = xRange[1].valueOf();
              // @type {number}
              const segmentCount = xTickCount - 1;
              // @type {number}
              const segmentSize = (maxX - minX) / segmentCount;

              const vals = [];

              for (let i = 0; i < segmentCount; i += 1) {
                const thisValue = new Date(minX + (segmentSize * i));

                vals.push(thisValue);
              }

              return vals;
            },
          },
        },
      },
      point: {
        show: false,
      },
      legend: {
        hide: true,
      },
    });

    this.props.onRenderEnd();
  }

  render () {
    const dataUncertaintyValues = this.dataUncertaintyValues;

    return (
      <div>
        <div
          ref={(ref) => this._chartContainer = ref}
        />
        {dataUncertaintyValues && (
          <Toggle
            label="Show uncertainty"
            labelPosition="right"
            toggled={this.state.displayDataUncertaintyValues}
            onToggle={this.onToggleDataUncertainty}
          />
        )}
      </div>
    );
  }
}
