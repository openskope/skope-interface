import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  RangeFilter,
  RangeAccessor,
  FieldContextFactory,
  RangeQuery,
  renderComponent,
} from 'searchkit';
import DatePicker from 'material-ui/DatePicker';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from 'material-ui/Toolbar';

import {
  getPrecisionByResolution,
  getDateStringAtPrecision,
  parseDateStringWithPrecision,
} from '/imports/ui/helpers';

const dateStringFormatForPrecisions = [
  'YYYY',
  'YYYY-MM',
  'YYYY-MM-DD',
];

/**
 * An extended version of RangeAccessor to support multi-field range filtering
 * and aggregation.
 */
class DataTemporalRangeAccessor extends RangeAccessor {
  /**
   * @param {string} key
   * @param {Object} options
   * @param {Array.<string>} options.fields - An array of field names to be considered.
   * @param {string} options.resolution - Resolution of date stored.
   * @param {string} options.relation - Relation used in range matching.
   */
  constructor (key, options) {
    super(key, options);

    // Discard the properties created by `RangeAccessor` for its single field.
    delete this.options.fieldOptions.field;
    delete this.fieldContext;
    // And create the corresponding ones for our multi-fields.
    this.options.fieldOptions.fields = this.options.fields;

    this.fieldContexts = this.options.fields.map((field) => FieldContextFactory({
      ...this.options.fieldOptions,
      field,
    }));
  }

  /**
   * @param {ImmutableQuery} query
   * @returns {ImmutableQuery}
   */
  buildSharedQuery (query) {
    if (this.state.hasValue()) {
      /**
       * This value is read from URL and may contain unexpected values.
       * @type {{min: string, max: string}}
       */
      const stateValue = this.state.getValue();
      const rangeInRawString = [
        stateValue.min,
        stateValue.max,
      ];

      const datePrecision = getPrecisionByResolution(this.options.resolution);
      const rangeInDate = rangeInRawString
      .map((str) => {
        return parseDateStringWithPrecision(
          str,
          datePrecision,
          dateStringFormatForPrecisions,
        );
      });
      const rangeInDateString = rangeInDate
      .map((date) => {
        return getDateStringAtPrecision(
          date,
          datePrecision,
          dateStringFormatForPrecisions,
        );
      });

      const selectedFilter = {
        name: this.translate(this.options.title),
        // `this.getSelectedValue` builds a string from min and max.
        value: this.getSelectedValue({
          min: rangeInDateString[0],
          max: rangeInDateString[1],
        }),
        id: this.options.id,
        remove: () => {
          this.state = this.state.clear();
        },
      };

      const newQuery = this.options.fields
      .reduce((q, field, fieldIndex) => {
        const rangeFilter = this.fieldContexts[fieldIndex].wrapFilter(RangeQuery(field, {
          gte: moment(rangeInDate[0]).format('YYYY-MM-DD'),
          lte: moment(rangeInDate[1]).format('YYYY-MM-DD'),
          format: 'yyyy-MM-dd',
          relation: this.options.relation,
        }));

        return q.addFilter(`${this.uuid}__${field}`, rangeFilter);
      }, query)
      .addSelectedFilter(selectedFilter);

      return newQuery;
    }

    return query;
  }

  /**
   * ! This disables the bucketing.
   * @returns {Array.<{key, doc_count : number}>}
   */
  getBuckets = () => [];

  /**
   * @returns {bool}
   */
  isDisabled = () => false;

  /**
   * ! Disabled on purpose.
   * @param {ImmutableQuery} query
   * @returns {ImmutableQuery}
   */
  buildOwnQuery = (query) => query;
}

class DateRangeInput extends React.Component {
  static propTypes = {
    // Min possible value.
    min: PropTypes.instanceOf(Date),
    // Max possible value.
    max: PropTypes.instanceOf(Date),
    // Value of the current lower bound.
    minValue: PropTypes.instanceOf(Date),
    // Value of the current upper bound.
    maxValue: PropTypes.instanceOf(Date),
    // Callback when either `minValue` or `maxValue` changes.
    onChange: PropTypes.func,
    // Callback when either `minValue` or `maxValue` changes.
    onFinished: PropTypes.func,
    // Resolution of the date.
    resolution: PropTypes.string,
  };

  static defaultProps = {
    min: null,
    max: null,
    minValue: null,
    maxValue: null,
    onChange: () => {},
    onFinished: () => {},
    resolution: 'date',
  };

  static dateFormatsForResolutions = [
    'YYYY',
    'YYYY-MM',
    'YYYY-MM-DD',
  ];

  /**
   * Build a date string of the date with the precision of the current dataset.
   * @param  {Date} date
   * @return {string}
   */
  buildPreciseDateString = (date) => {
    const datePrecision = getPrecisionByResolution(
      this.props.resolution,
    );

    return getDateStringAtPrecision(
      date,
      datePrecision,
      DateRangeInput.dateFormatsForResolutions,
    );
  };

  minDateOnChange = (event, date) => {
    const {
      maxValue,
      onChange,
      onFinished,
    } = this.props;
    const newMinValue = date;

    if (maxValue && newMinValue) {
      onFinished({
        min: newMinValue,
        max: maxValue,
      });
      return;
    }

    onChange({
      min: newMinValue,
      max: maxValue,
    });
  };

  maxDateOnChange = (event, date) => {
    const {
      minValue,
      onChange,
      onFinished,
    } = this.props;
    const newMaxValue = date;

    if (minValue && newMaxValue && onFinished) {
      onFinished({
        min: minValue,
        max: newMaxValue,
      });
      return;
    }

    if (onChange) {
      onChange({
        min: minValue,
        max: newMaxValue,
      });
    }
  };

  render = () => {
    const {
      min: minDate,
      max: maxDate,
      minValue,
      maxValue,
    } = this.props;

    return (
      <Toolbar
        style={{
          background: 'transparent',
        }}
      >
        <ToolbarGroup>
          <DatePicker
            ref={(ref) => this._minDatePicker = ref}
            openToYearSelection
            hintText="Start"
            value={minValue}
            minDate={minDate}
            maxDate={maxDate}
            formatDate={this.buildPreciseDateString}
            onChange={this.minDateOnChange}
            style={{
              flex: '1 1 0',
            }}
            textFieldStyle={{
              width: 'auto',
            }}
          />
          <ToolbarSeparator
            style={{
              marginLeft: '10px',
              marginRight: '10px',
            }}
          />
          <DatePicker
            ref={(ref) => this._maxDatePicker = ref}
            openToYearSelection
            hintText="End"
            value={maxValue}
            minDate={minDate}
            maxDate={maxDate}
            formatDate={this.buildPreciseDateString}
            onChange={this.maxDateOnChange}
            style={{
              flex: '1 1 0',
            }}
            textFieldStyle={{
              width: 'auto',
            }}
          />
        </ToolbarGroup>
      </Toolbar>
    );
  };
}

/**
 * An extended version of RangeFilter to support multi-field range filtering
 * and aggregation.
 */
export default class DataTemporalRangeFilter extends RangeFilter {
  static propTypes = {
    ...RangeFilter.propTypes,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    field: PropTypes.string,
    // Resolution of date.
    resolution: PropTypes.string,
    // Relation of the range match.
    relation: PropTypes.string,
  };

  static defaultProps = {
    ...RangeFilter.defaultProps,
    rangeComponent: DateRangeInput,
    resolution: 'date',
    relation: 'within',
  };

  // @see `getPrecisionByResolution`.
  get datePrecision () {
    return getPrecisionByResolution(this.props.resolution);
  }

  defineAccessor () {
    const {
      id,
      title,
      min,
      max,
      fields,
      fieldOptions,
      interval,
      rangeFormatter,
      translations,
      resolution,
      relation,
    } = this.props;

    return new DataTemporalRangeAccessor(id, {
      id,
      min,
      max,
      title,
      fields,
      rangeFormatter,
      translations,
      interval,
      fieldOptions,
      resolution,
      relation,
    });
  }

  /**
   * @param {{min: Date, max: Date}} newValues
   */
  rangeUpdate = (newValues) => {
    if (!newValues.min && !newValues.max) {
      this.accessor.state = this.accessor.state.clear();
    } else {
      const datePrecision = this.datePrecision;
      const minDateString = getDateStringAtPrecision(
        newValues.min,
        datePrecision,
        dateStringFormatForPrecisions,
      );
      const maxDateString = getDateStringAtPrecision(
        newValues.max,
        datePrecision,
        dateStringFormatForPrecisions,
      );

      this.accessor.state = this.accessor.state.setValue({
        min: minDateString,
        max: maxDateString,
      });
    }

    this.forceUpdate();
  };

  rangeUpdateAndSearch = (newValues) => {
    this.rangeUpdate(newValues);
    this.searchkit.performSearch();
  };

  getValueFromState = () => {
    // Values stored in the state are date strings.
    const stateValue = this.accessor.state.getValue();
    const datePrecision = this.datePrecision;
    const minDate = parseDateStringWithPrecision(
      stateValue.min,
      datePrecision,
      dateStringFormatForPrecisions,
    );
    const maxDate = parseDateStringWithPrecision(
      stateValue.max,
      datePrecision,
      dateStringFormatForPrecisions,
    );

    return {
      min: minDate,
      max: maxDate,
    };
  };

  renderRangeComponent = (component) => {
    const trimmedBuckets = this.accessor.getBuckets();
    const hasNonEmptyBucket = trimmedBuckets.length > 0;
    const lowBucket = trimmedBuckets[0];
    const highBucket = trimmedBuckets[trimmedBuckets.length - 1];

    const min = hasNonEmptyBucket ? lowBucket.key : this.props.min;
    const max = hasNonEmptyBucket ? highBucket.key : this.props.max;

    const currentValue = this.getValueFromState();

    return renderComponent(component, {
      min,
      max,
      // minValue: Math.max(Number(get(state, 'min', min)), min),
      minValue: currentValue.min,
      // maxValue: Math.min(Number(get(state, 'max', max)), max),
      maxValue: currentValue.max,
      onChange: this.rangeUpdate,
      onFinished: this.rangeUpdateAndSearch,
      rangeFormatter: this.props.rangeFormatter,
      resolution: this.props.resolution,
    });
  };
}
