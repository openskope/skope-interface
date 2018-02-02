import moment from 'moment';

/**
 * Make sure the filter value is correct.
 */
export
const clampFilterValue = (value, min, max) => {
  let newValue = parseInt(value, 10);
  newValue = isNaN(newValue) ? min : newValue;
  newValue = Math.max(min, newValue);
  newValue = Math.min(newValue, max);
  return newValue;
};

/**
 * This function resets all the temporal unit fields outside of the precision
 * to their corresponding zero points.
 * This function returns a new Date object and does not modify the inputs.
 * @param {Date} date
 * @param {number} precision - 0: year, 1: month, 2: day,
 *                             3: hour, 4: minute, 5: second, 6: millisecond
 * @return {Date}
 */
export
const getDateAtPrecision = (
  (precisions) =>
    (
      date,
      precision,
    ) =>
      precisions.reduce((acc, { handler, zeroPoint }, index) => {
        // Only need to run precision handlers larger than precision.
        if (index <= precision) {
          return acc;
        }

        const newDate = new Date(acc);

        handler.call(newDate, zeroPoint);

        return newDate;
      }, date)
)([
  {
    handler: Date.prototype.setFullYear,
    zeroPoint: 0,
  },
  {
    handler: Date.prototype.setMonth,
    zeroPoint: 0,
  },
  {
    handler: Date.prototype.setDate,
    zeroPoint: 1,
  },
  {
    handler: Date.prototype.setHours,
    zeroPoint: 0,
  },
  {
    handler: Date.prototype.setMinutes,
    zeroPoint: 0,
  },
  {
    handler: Date.prototype.setSeconds,
    zeroPoint: 0,
  },
  {
    handler: Date.prototype.setMilliseconds,
    zeroPoint: 0,
  },
]);

/**
 * @param {string} resolution
 */
export
const getPrecisionByResolution = (
  (resolutionToPrecision) => (
    resolution,
  ) => resolutionToPrecision[resolution]
)({
  year: 0,
  month: 1,
  date: 2,
  hour: 3,
  minute: 4,
  second: 5,
  millisecond: 5,
});

/**
 * @param {Date} date
 * @param {number} precision
 */
export
const getDateStringAtPrecision = (
  (dateFormatForPrecisions) =>
    (date, precision) => {
      if (!date) {
        return '';
      }

      const dateAtPrecision = getDateAtPrecision(date, precision);
      const dateTemplateAtPrecision = dateFormatForPrecisions[precision];

      return moment(dateAtPrecision).format(dateTemplateAtPrecision);
    }
)([
  'YYYY',
  'MMM YYYY',
  'MMM Do YYYY',
  'MMM Do YYYY, h a',
  'MMM Do YYYY, h:m a',
  'MMM Do YYYY, h:m:s a',
]);

/**
 * @param {number} precision
 * @param {Date} start
 * @param {Date} end
 */
export
const getDateRangeStringAtPrecision = (
  precision,
  start,
  end,
) => {
  if (!start && !end) {
    return '';
  }

  return [start, end]
  .map((d) => getDateStringAtPrecision(d, precision))
  .join(' - ');
};

/**
 * @param {Object} geometry
 */
export
const buildGeoJsonWithGeometry = (geometry) => {
  if (!geometry) {
    return null;
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry,
      },
    ],
  };
};
