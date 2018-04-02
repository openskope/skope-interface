import {
  FlowRouter,
} from 'meteor/ostrio:flow-router-extra';
import globalStore, { actions } from '/imports/ui/redux-store';

import {
  mount,
} from './react';

/**
 * Generates absolute urls within the app.
 * @param  {String} pathDef
 * @param  {Object} params
 * @param  {Object} queryParams
 * @return {String}
 */
export
const absoluteUrl = (
  pathDef,
  params = {},
  queryParams = {},
) => FlowRouter.path(pathDef, params, queryParams);

/**
 * @see {@link https://github.com/VeliovGroup/flow-router/blob/master/docs/api/current.md}
 */
export
const getCurrentRoute = () => FlowRouter.current();

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
