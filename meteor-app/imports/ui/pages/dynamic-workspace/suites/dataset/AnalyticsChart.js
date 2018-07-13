import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import objectPath from 'object-path';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js/dist/plotly';
import Toggle from 'material-ui/Toggle';

import {
  dataChartShowUncertaintyByDefault,
} from '/imports/ui/consts';

import {
  getPrecisionByResolution,
  offsetDateAtPrecision,
  NOOP,
} from '/imports/helpers/model';

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
    onRenderStart: NOOP,
    onRenderEnd: NOOP,
  };

  static tickMarkFormatsPerResolution = {
    year: '%Y',
    month: '%Y-%m',
  };

  constructor (props) {
    super(props);

    this.state = {
      displayDataUncertaintyValues: dataChartShowUncertaintyByDefault,
    };

    this._graphDiv = null;
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !(_.isEqual(nextProps, this.props) && _.isEqual(nextState, this.state));
  }

  onPlotInitialized = (figure, graphDiv) => {
    this._graphDiv = graphDiv;
  };

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

  getXValues () {
    const {
      temporalResolution,
      temporalPeriod,
      data,
    } = this.props;
    const temporalPrecision = getPrecisionByResolution(temporalResolution);
    const startDate = new Date(temporalPeriod.gte);
    const xAxisLabelBaseIndex = objectPath.get(data, 'range.start', 0);
    const dataValues = objectPath.get(data, 'values', []);
    const xAxisValues = dataValues.map((v, index) => {
      const date = offsetDateAtPrecision(startDate, temporalPrecision, xAxisLabelBaseIndex + index);

      return date;
    });

    return xAxisValues;
  }

  getPlotData () {
    const {
      data,
    } = this.props;
    const {
      displayDataUncertaintyValues,
    } = this.state;
    const dataValues = objectPath.get(data, 'values', []);
    const xValues = this.getXValues();
    const dataUncertaintyValues = this.dataUncertaintyValues;

    if (displayDataUncertaintyValues && dataUncertaintyValues) {
      return [
        {
          x: xValues,
          y: dataUncertaintyValues[0],
          line: {
            width: 0,
          },
          marker: {
            color: '444',
          },
          mode: 'lines',
          name: 'Range -',
          type: 'scatter',
        },
        {
          x: xValues,
          y: dataValues,
          fill: 'tonexty',
          fillcolor: 'rgba(68, 68, 68, 0.3)',
          line: {
            width: 1,
            color: 'rgb(31, 119, 180)',
          },
          mode: 'lines',
          name: 'Measurement',
          type: 'scatter',
        },
        {
          x: xValues,
          y: dataUncertaintyValues[1],
          fill: 'tonexty',
          fillcolor: 'rgba(68, 68, 68, 0.3)',
          line: {
            width: 0,
          },
          marker: {
            color: '444',
          },
          mode: 'lines',
          name: 'Range +',
          type: 'scatter',
        },
      ];
    }

    return [{
      x: xValues,
      y: dataValues,
      line: {
        width: 1,
        color: 'rgb(31, 119, 180)',
      },
      mode: 'lines',
      name: 'Measurement',
      type: 'scatter',
    }];
  }

  toBlob = async (options = {}) => {
    if (!this._graphDiv) {
      return null;
    }

    const {
      format = 'png',
      height = 480,
      width = 1280,
    } = options;

    const dataUrl = await Plotly.toImage(this._graphDiv, {
      format,
      height,
      width,
    });

    const blob = await (await fetch(dataUrl)).blob();

    return blob;
  };

  /**
   * ! Try to reconnect `onRenderStart` and `onRenderEnd`.
   */
  render () {
    const {
      variableName,
      temporalResolution,
    } = this.props;
    const dataUncertaintyValues = this.dataUncertaintyValues;
    const tickMarkFormat = AnalyticsChart.tickMarkFormatsPerResolution[temporalResolution];
    const plotData = this.getPlotData();
    const plotLayout = {
      // title: `${data.datasetId}`,
      margin: {
        b: 50,
        t: 30,
        r: 30,
      },
      autosize: true,
      showlegend: false,
      hovermode: 'x',
      yaxis: {
        title: variableName,
        // This disables zooming on y-axis.
        fixedrange: true,
      },
      xaxis: {
        title: `Date (${temporalResolution})`,
        // tickformat: tickMarkFormat,
        hoverformat: tickMarkFormat,
      },
    };
    const plotConfig = {
      showLink: false,
      displaylogo: false,
      // Modebar Buttons names at https://github.com/plotly/plotly.js/blob/master/src/components/modebar/buttons.js
      modeBarButtonsToRemove: [
        'sendDataToCloud',
      ],
    };

    return (
      <div className="AnalyticsChart">
        <Plot
          data={plotData}
          layout={plotLayout}
          config={plotConfig}
          style={{
            width: '100%',
            height: '100%',
          }}
          useResizeHandler
          // This seems to only run for the first time the plot is mounted.
          onInitialized={this.onPlotInitialized}
          // For some reason this is not called for the first render after `onInitialized`.
          // onAfterPlot={this.props.onRenderEnd}
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
