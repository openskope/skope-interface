/**
 * Make sure the filter value is correct.
 */
export const clampFilterValue = (value, min, max) => {
  let newValue = parseInt(value, 10);
  newValue = isNaN(newValue) ? min : newValue;
  newValue = Math.max(min, newValue);
  newValue = Math.min(newValue, max);
  return newValue;
};
