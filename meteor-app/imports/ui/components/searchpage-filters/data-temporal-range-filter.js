import PropTypes from 'prop-types';
import {
  RangeInput,
  RangeFilter,
  RangeAccessor,
  FieldContextFactory,
  RangeQuery,
  renderComponent,
} from 'searchkit';
import get from 'lodash/get';

/**
 * An extended version of RangeAccessor to support multi-field range filtering
 * and aggregation.
 */
class DataTemporalRangeAccessor extends RangeAccessor {
  /**
   * Convert year to Unix timestamp.
   * @param {number} year
   * @return {number}
   */
  static getUnixTimestampFromYear (year) {
    // This initializes the date object to have all 0s in hour, minute, second. Regardless of timezone.
    const date = new Date(0);

    date.setFullYear(year);

    return date.valueOf();
  }

  /**
   * @param {string} key
   * @param {Object} options
   * @param {Array.<string>} options.fields - An array of field names to be considered.
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
      const val = this.state.getValue();
      const selectedFilter = {
        name: this.translate(this.options.title),
        value: this.getSelectedValue(val),
        id: this.options.id,
        remove: () => {
          this.state = this.state.clear();
        },
      };

      const newQuery = this.options.fields
      .reduce((q, field, fieldIndex) => {
        const rangeFilter = this.fieldContexts[fieldIndex].wrapFilter(RangeQuery(field, {
          gte: DataTemporalRangeAccessor.getUnixTimestampFromYear(val.min),
          lte: DataTemporalRangeAccessor.getUnixTimestampFromYear(val.max),
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

/**
 * An extended version of RangeFilter to support multi-field range filtering
 * and aggregation.
 */
export default class DataTemporalRangeFilter extends RangeFilter {
  static propTypes = {
    ...RangeFilter.propTypes,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    field: PropTypes.string,
  };

  static defaultProps = {
    ...RangeFilter.defaultProps,
    rangeComponent: RangeInput,
    showHistogram: false,
  };

  defineAccessor () {
    const {
      id,
      title,
      min,
      max,
      fields,
      fieldOptions,
      interval,
      showHistogram,
      rangeFormatter,
      translations,
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
      loadHistogram: showHistogram,
      fieldOptions,
    });
  }

  renderRangeComponent (component) {
    const state = this.accessor.state.getValue();
    const trimmedBuckets = this.accessor.getBuckets();
    const hasNonEmptyBucket = trimmedBuckets.length > 0;
    const lowBucket = trimmedBuckets[0];
    const highBucket = trimmedBuckets[trimmedBuckets.length - 1];

    const min = hasNonEmptyBucket ? lowBucket.key : this.props.min;
    const max = hasNonEmptyBucket ? highBucket.key : this.props.max;

    return renderComponent(component, {
      min,
      max,
      minValue: Math.max(Number(get(state, 'min', min)), min),
      maxValue: Math.min(Number(get(state, 'max', max)), max),
      items: trimmedBuckets,
      onChange: this.sliderUpdate,
      onFinished: this.sliderUpdateAndSearch,
      rangeFormatter: this.props.rangeFormatter,
      marks: this.props.marks,
    });
  }
}
