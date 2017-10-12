import React from 'react';
import {
  Provider,
} from 'react-redux';
import {
  mount,
} from 'react-mounter';

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

/**
 * Helper for generating the final class name string.
 * @param  {Array.<string|Object>} ...items
 * @return {string}
 */
export const getClassName = (...items) =>
  items
  // If the item is a map, include all class names specified by the property name when the value is truthy.
  // For example, {a: true, b: false, c: true} => 'a c'.
  .map((x) => (
    typeof x === 'object' && x !== null
    ? Object.keys(x)
      .filter((key) => x[key])
      .join(' ')
    : String(x)
  ))
  // All falsy entries will be removed.
  .filter(Boolean)
  .join(' ');

/**
 * Helper function to incorporate `Provider` into react mounter.
 * @param  {Object} store - Global store from Redux.
 * @param  {React.Component} ComponentClass - Same as the first argument to `mount`.
 * @param  {Object} props - Same as the second argument to `mount`.
 * @return {*}
 */
export const mountWithStore = (store, ComponentClass, props) => mount(Provider, {
  store,
  children: <ComponentClass {...props} />,
});
