import _ from 'lodash';
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
 * @param {Date} date
 * @param {number} precision - 0: year, 1: month, 2: day,
 *                             3: hour, 4: minute, 5: second, 6: millisecond
 * @param {number} offset
 * @return {Date}
 */
export
const offsetDateAtPrecision = (
  (precisions) =>
    (
      date,
      precision,
      offset,
    ) => {
      const {
        setter,
        getter,
      } = precisions[precision];

      const newDate = new Date(date);

      let value = getter.call(newDate);

      value += offset;

      setter.call(newDate, value);

      return newDate;
    }
)([
  {
    setter: Date.prototype.setFullYear,
    getter: Date.prototype.getFullYear,
  },
  {
    setter: Date.prototype.setMonth,
    getter: Date.prototype.getMonth,
  },
  {
    setter: Date.prototype.setDate,
    getter: Date.prototype.getDate,
  },
  {
    setter: Date.prototype.setHours,
    getter: Date.prototype.getHours,
  },
  {
    setter: Date.prototype.setMinutes,
    getter: Date.prototype.getMinutes,
  },
  {
    setter: Date.prototype.setSeconds,
    getter: Date.prototype.getSeconds,
  },
  {
    setter: Date.prototype.setMilliseconds,
    getter: Date.prototype.getMilliseconds,
  },
]);

export
const ResolutionToPrecisionMapping = {
  year: 0,
  month: 1,
  date: 2,
  day: 2, // alias to "date".
  hour: 3,
  minute: 4,
  second: 5,
  millisecond: 5,
};

export
const AllResolutionNames = Object.keys(ResolutionToPrecisionMapping);

/**
 * @param {string} resolution
 * @returns {number}
 */
export
const getPrecisionByResolution = (
  (resolutionToPrecision) => (
    resolution,
  ) => resolutionToPrecision[resolution]
)(ResolutionToPrecisionMapping);

/**
 * @param {Date} date
 * @param {number} precision
 * @param {Array<string>} customFormats
 * @returns {string}
 */
export
const getDateStringAtPrecision = (
  (dateFormatForPrecisions) =>
    (date, precision, customFormats) => {
      if (!date) {
        return '';
      }

      const dateAtPrecision = getDateAtPrecision(date, precision);
      const dateTemplateAtPrecision = (customFormats || dateFormatForPrecisions)[precision];

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
 * @param {string} dateString
 * @param {number} precision
 * @param {Array<string>} customFormats
 * @returns {Date}
 */
export
const parseDateStringWithPrecision = (
  (dateStringFormatForPrecisions) =>
    (dateString, precision, customFormats) => {
      if (!dateString) {
        return null;
      }

      const format = (customFormats || dateStringFormatForPrecisions)[precision];

      if (!format) {
        return null;
      }

      // Use strict parsing to avoid unpredictable results. (`true` in the 3rd argument).
      const $date = moment(dateString, format, true);

      if (!$date.isValid()) {
        return null;
      }

      const date = $date.toDate();

      return date;
    }
)([
  'YYYY',
  'YYYY-MM',
  'YYYY-MM-DD',
]);

/**
 * @param {number} precision
 * @param {Date} start
 * @param {Date} end
 * @returns {string}
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
 * @returns {Object}
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

/**
 * Return the same input string with placeholders filled.
 * Fillers could be functions or literal values.
 * @param {string} templateString
 * @param {Object<string, Function|*>} fillers
 * @returns {string}
 */
export
const fillTemplateString = (templateString, fillers) => {
  if (!templateString) {
    return templateString;
  }

  const fillerNames = Object.keys(fillers);

  return fillerNames.reduce((acc, fillerName) => {
    const pattern = `{${fillerName}}`;
    const filler = fillers[fillerName];
    const replacement = typeof filler === 'function' ? filler() : filler;

    let newAcc = acc;

    while (newAcc.indexOf(pattern) !== -1) {
      newAcc = newAcc.replace(pattern, replacement);
    }

    return newAcc;
  }, templateString);
};

export
function difference(object, base) {
  return _.transform(object, function(result, value, key) {
    if (!_.isEqual(value, base[key])) {
      result[key] = (_.isObject(value) && _.isObject(base[key]))
                    ? difference(value, base[key])
                    : value;
    }
  });
}
