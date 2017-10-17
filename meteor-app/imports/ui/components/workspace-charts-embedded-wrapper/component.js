import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Charts from '/imports/ui/components/workspace-charts';

export default class ChartsWrapper extends React.Component {
  static propTypes = {
    // Indicate if a point is selected for inspection.
    inspectPointSelected: PropTypes.bool.isRequired,
    // The coordinate of the point being inspected.
    inspectPointCoordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
    // Function to load the data.
    loadDataForPoint: PropTypes.func.isRequired,
    // Function to clear the loaded data.
    clearLoadedData: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this.state = {
      inspectPointSelected: false,
      inspectPointCoordinate: [0, 0],
    };
  }

  componentWillReceiveProps (nextProps) {
    const {
      inspectPointSelected,
      inspectPointCoordinate,
    } = nextProps;

    this.setState({
      inspectPointSelected,
      inspectPointCoordinate,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    const {
      inspectPointSelected: nextSelected,
      inspectPointCoordinate: nextCoord,
    } = nextState;
    const {
      inspectPointSelected: currSelected,
      inspectPointCoordinate: currCoord,
    } = this.state;

    if (nextSelected) {
      // Load new data if needed.
      if (!currSelected || !_.isEqual(currCoord, nextCoord)) {
        nextProps.loadDataForPoint(nextCoord);
      }
    } else if (currSelected) {
      // Clear data.
      nextProps.clearLoadedData();
    }

    return true;
  }

  render () {
    return <Charts {...this.props} />;
  }
}
