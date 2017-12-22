import React from 'react';
import {
  RangeFilter,
} from 'searchkit';

export default class DataTemporalRangeFilter extends React.Component {
  componentDidUpdate (prevProps) {
    if (
      prevProps.min === -1 && prevProps.max === -1
      && this.props.min !== -1 && this.props.max !== -1
      && this._rangeFilter
    ) {
      this._rangeFilter.sliderUpdateAndSearch({
        min: this.props.min,
        max: this.props.max,
      });
    }
  }

  render () {
    if (this.props.min === -1 && this.props.max === -1) {
      return null;
    }

    return (
      <RangeFilter
        {...this.props}
        ref={(ref) => this._rangeFilter = ref}
      />
    );
  }
}
