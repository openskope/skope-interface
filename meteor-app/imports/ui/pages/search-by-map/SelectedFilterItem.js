import React from 'react';
import PropTypes from 'prop-types';
import Chip from 'material-ui/Chip';

const LabelValueFormatters = {
  //! Add formatters here.
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
      return labelValue ? `${labelKey}: ${labelValue}` : labelKey;
    }

    const formattedLabelValue = LabelValueFormatters[labelKey](labelValue);

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
