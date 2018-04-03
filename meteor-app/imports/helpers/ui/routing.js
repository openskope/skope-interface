import {
  FlowRouter,
} from 'meteor/ostrio:flow-router-extra';
import createBrowserHistory from 'history/createBrowserHistory';
import globalStore, { actions } from '/imports/ui/redux-store';
import {
  relative,
} from 'path';

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

class FlowRouterHistory {
  constructor (...args) {
    this._history = createBrowserHistory(...args);
  }

  get length () {
    return this._history.length;
  }

  get location () {
    return this._history.location;
  }

  get action () {
    return this._history.action;
  }

  /**
   * ! Need lots more edge case handling for different kinds of `path` values.
   * ! What if `path` is an external url? Would that actually happen?
   * ! What if `path` is local but pointing to a target that's not under this app?
   * @param {string} path
   * @param {Object} state
   */
  push(path, state) {
    const basePath = absoluteUrl('');

    if (path.indexOf(basePath) === 0) {
      const relPath = relative(basePath, path);

      FlowRouter.go(relPath);
    } else {
      console.warn('FlowRouterHistory.push', 'external path', path);
      this._history.push(path, state);
    }
  }

  /**
   *! Need lots more edge case handling for different kinds of `path` values.
   * @param {string} path
   * @param {Object} state
   */
  replace (path, state) {
    const basePath = absoluteUrl('');

    if (path.indexOf(basePath) === 0) {
      const relPath = relative(basePath, path);

      FlowRouter.go(relPath);
    } else {
      console.warn('FlowRouterHistory.replace', 'external path', path);
      this._history.replace(path, state);
    }
  }

  go (n) {
    console.warn('FlowRouterHistory.go', 'not implemented');
  }

  goBack () {
    console.warn('FlowRouterHistory.goBack', 'not implemented');
  }

  goForward () {
    console.warn('FlowRouterHistory.goForward', 'not implemented');
  }

  /**
   * @param {Function(location, action)} func
   * @return {Function}
   */
  listen (func) {
    return this._history.listen(func);
  }
}

export
const createFlowRouterHistory = (...args) => new FlowRouterHistory(...args);

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
    params,
    queryParams,
  });

  mount(ComponentClass, {
    ...props,
    route: this,
    params,
    queryParams,
  });
};
