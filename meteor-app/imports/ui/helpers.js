import React from 'react';
import {
  Provider,
} from 'react-redux';
import {
  mount as reactMount,
} from 'react-mounter';
import {
  FlowRouter,
} from 'meteor/ostrio:flow-router-extra';
import globalStore, { actions } from '/imports/ui/redux-store';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import globalTheme from '/imports/ui/styling/muiTheme';

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
 * Helper for generating the final class name string.
 * @param  {Array.<string|Object>} ...items
 * @return {string}
 */
export
const getClassName = (...items) =>
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
export
const mountWithStore = (store, ComponentClass, props) => reactMount(Provider, {
  store,
  children: <ComponentClass {...props} />,
});

/**
 * A even more simplified version of `mountWithStore` that by default uses the global store.
 * It also applies the default Material UI theme.
 * @param  {React.Component} ComponentClass - Same as the first argument to `mount`.
 * @param  {Object} props - Same as the second argument to `mount`.
 * @return {*}
 */
export
const mount =
(
  ComponentClass,
  {
    store = globalStore,
    muiTheme = globalTheme,
    ...props
  },
) => mountWithStore(store, MuiThemeProvider, {
  muiTheme,
  children: <ComponentClass {...props} />,
});

/**
 * This is a utility component for debugging purposes.
 * It prints all the props passed to it.
 */
export
const PropPrinter = (props) => <pre>{JSON.stringify(props, null, 2)}</pre>;

/**
 * Generates absolute urls within the app.
 * @param  {String} pathDef
 * @param  {Object} params
 * @param  {Object} queryParams
 * @return {String}
 */
export
const absoluteUrl = (pathDef, params = {}, queryParams = {}) => FlowRouter.path(pathDef, params, queryParams);

/**
 * Helper for generating simple route actions.
 * @param  {React.Component} ComponentClass - Same as the first argument to `mount`.
 * @param  {Object} props - Same as the second argument to `mount`.
 * @return {Function}
 */
export
const simpleMountAction = (ComponentClass, props) =>
function (params, queryParams) {
  // These are available properties on the context.
  // - this.group
  // - this.name
  // - this.path
  // - this.pathDef

  globalStore.dispatch({
    type: actions.PAGE_ENTRY.type,
    path: this.pathDef,
  });

  mount(ComponentClass, {
    ...props,
    route: this,
    params,
    queryParams,
  });
};

/**
 * This function resets all the temporal unit fields outside of the precision to their corresponding zero points.
 * This function returns a new Date object and does not modify the inputs.
 * @param {Date} date
 * @param {number} precision
 * @return {Date}
 */
export
const getDateAtPrecision = (
  (precisions) =>
    (date, precision) =>
      precisions.reduce((acc, { handler, zeroPoint }, index) => {
        // Only need to run precision handlers larger than precision.
        if (index <= precision) {
          return acc;
        }

        const newDate = new Date(date);

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
