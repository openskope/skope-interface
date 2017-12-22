import React from 'react';
import PropTypes from 'prop-types';
import {
  SearchkitManager,
  RangeFilter,
  RangeAccessor,
  FieldContextFactory,
  RangeQuery,
  BoolMust,
  HistogramBucket,
  FilterBucket,
  CardinalityMetric,
  renderComponent,
} from 'searchkit';
import get from 'lodash/get';

/**
 * An extended version of RangeAccessor to support multi-field range filtering
 * and aggregation.
 */
class MultiFieldRangeAccessor extends RangeAccessor {
  /**
   * @param {string} key
   * @param {Object} options
   * @param {Array.<string>} options.fields - An array of field names to be considered.
   * @param {bool} options.dynamicHistogram - Set to `true` to only show histogram between min and max.
   */
  constructor (key, options) {
    super(key, options);

    delete this.options.fieldOptions.field;
    delete this.fieldContext;
    this.options.fieldOptions.fields = this.options.fields;

    this.fieldContexts = this.options.fields.map((field) => FieldContextFactory({
      ...this.options.fieldOptions,
      field,
    }));
  }

  /**
   * This is modifying the global aggregation to add the aggregations needed by the histogram.
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

      const newQuery = this.options.fields.reduce((q, field, fieldIndex) => {
        const rangeFilter = this.fieldContexts[fieldIndex].wrapFilter(RangeQuery(field, {
          gte: this.options.dynamicHistogram ? val.min : this.options.min,
          lte: this.options.dynamicHistogram ? val.max : this.options.max,
        }));

        return q.addFilter(`${this.uuid}__${field}`, rangeFilter);
      }, query)
      .addSelectedFilter(selectedFilter);

      console.log('buildSharedQuery', newQuery);

      return newQuery;
    }

    return query;
  }

  /**
   * @returns {Array.<{key, doc_count : number}>}
   */
  getAllBuckets () {
    return this.options.fields.reduce((acc, field, fieldIndex) => {
      const uuid = `${this.uuid}__${field}`;
      const result = this.getAggregations([
        uuid,
        this.fieldContexts[fieldIndex].getAggregationPath(),
        this.key,
        'buckets',
      ], []);

      if (acc === null) {
        return result;
      }

      return acc.map(({
        key,
        doc_count,
      }, bucketIndex) => ({
        key,
        doc_count: doc_count + result[bucketIndex].doc_count,
      }));
    }, null);
  }

  /**
   * @returns {Array.<{key, doc_count : number}>}
   */
  getBuckets () {
    const allBuckets = this.getAllBuckets();
    const trimmedBuckets = allBuckets
    .reduce((acc, bucket) => {
      if (acc.length === 0 && bucket.doc_count === 0) {
        return acc;
      }

      return [
        ...acc,
        bucket,
      ];
    }, [])
    .reduceRight((acc, bucket) => {
      if (acc.length === 0 && bucket.doc_count === 0) {
        return acc;
      }

      return [
        bucket,
        ...acc,
      ];
    }, []);

    console.log('trimmedBuckets', trimmedBuckets.length);

    return trimmedBuckets;
  }

  /**
   * @returns {bool}
   */
  isDisabled = () => false;

  /**
   * Build the query used to filter the results.
   * @param {ImmutableQuery} query 
   * @returns {ImmutableQuery}
   */
  buildOwnQuery (query) {
    const trimmedBuckets = this.getBuckets();
    const hasNonEmptyBucket = trimmedBuckets.length > 0;
    const lowBucket = trimmedBuckets[0];
    const highBucket = trimmedBuckets[trimmedBuckets.length - 1];

    const min = hasNonEmptyBucket ? lowBucket.key : this.options.min;
    const max = hasNonEmptyBucket ? highBucket.key : this.options.max;

    return this.options.fields.reduce((q, field, fieldIndex) => {
      const uuid = `${this.uuid}__${field}`;
      const otherFilters = q.getFiltersWithoutKeys(uuid);
      const filters = BoolMust([
        otherFilters,
        this.fieldContexts[fieldIndex].wrapFilter(
          RangeQuery(field, {
            gte: min,
            lte: max,
          }),
        ),
      ]);

      let metric;
      if (this.options.loadHistogram) {
        metric = HistogramBucket(this.key, field, {
          interval: this.getInterval(),
          min_doc_count: 0,
          extended_bounds: {
            min: this.options.min,
            max: this.options.max,
          },
        });
      } else {
        metric = CardinalityMetric(this.key, field);
      }

      return q.setAggs(FilterBucket(
        uuid,
        filters,
        ...this.fieldContexts[fieldIndex].wrapAggregations(metric),
      ));
    }, query);
  }
}

/**
 * An extended version of RangeFilter to support multi-field range filtering
 * and aggregation.
 */
export default class MultiFieldRangeFilter extends RangeFilter {
  static propTypes = {
    ...RangeFilter.propTypes,
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    field: PropTypes.string,
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

    return new MultiFieldRangeAccessor(id, {
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
