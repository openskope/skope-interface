import React from 'react';
import PropTypes from 'prop-types';
import Chip from 'material-ui/Chip';
import moment from 'moment';

/**
 * Expect the value input to be in the form of `<min> - <max>`.
 * `min` and `max` are both timestamps in milliseconds.
 * @type   {Function}
 * @param  {String} labelValue
 * @return {String}
 */
const DynamicDateRangeFormatter =
(labelValue) => labelValue
.split(' - ')
.map((timeString) => parseInt(timeString, 10))
.map((timestamp) => moment(timestamp).format('YYYY-MM-DD'))
.join(' - ');

const LabelValueFormatters = {
  // 'Start Date': DynamicDateRangeFormatter,
  // 'End Date': DynamicDateRangeFormatter,
};

export default class FilterItem extends React.PureComponent {
  static propTypes = {
    bemBlocks: PropTypes.object.isRequired,
    filterId: PropTypes.string.isRequired,
    labelKey: PropTypes.string.isRequired,
    labelValue: PropTypes.string.isRequired,
    removeFilter: PropTypes.func.isRequired,
  };

  static formatLabel = (labelKey, labelValue) => {
    if (!(labelKey in LabelValueFormatters)) {
      return `${labelKey}: ${labelValue}`;
    }

    const formattedLabelValue = LabelValueFormatters[labelKey](labelValue);

    console.info('LabelValueFormatters', {
      labelKey,
      labelValue,
      formattedLabelValue,
    });

    return formattedLabelValue
    ? `${labelKey}: ${formattedLabelValue}`
    : labelKey;
  };

  render () {
    const {
      bemBlocks,
      filterId,
      labelKey,
      labelValue,
      removeFilter,
    } = this.props;

    const containerClassName =
    bemBlocks.option()
    .mix(bemBlocks.container('item'))
    .mix(`selected-filter--${filterId}`)
    .toString();
    const formattedLabel = this.constructor.formatLabel(labelKey, labelValue);

    return (
      <div
        className={containerClassName}
        style={{
          background: 'transparent',
          padding: 0,
        }}
      >
        <Chip
          onRequestDelete={removeFilter}
        >
          <div className={bemBlocks.option('name')}>{formattedLabel}</div>
        </Chip>
      </div>
    );
  }
}
