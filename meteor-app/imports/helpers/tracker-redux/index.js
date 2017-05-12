import { Tracker } from "meteor/tracker";
import { createStore as _createStore } from "redux";

/**
 * This is a helper function that creates a redux store that is bound to a tracker dependency.
 * So that when `.getState()` is used in a tracker computation, `.dispatch()` would invalidate it and cause the computation to be re-run.
 * The interface should be the same as `createStore` from redux.
 */
export const createStore = (...args) => {
  const trackerDep = new Tracker.Dependency();
  const newStore = _createStore(...args);

  const _getState = newStore.getState.bind(newStore);
  const _dispatch = newStore.dispatch.bind(newStore);

  newStore.getState = (..._args) => {
    trackerDep.depend();

    const result = _getState(..._args);

    return result;
  };
  newStore.dispatch = (..._args) => {
    const result = _dispatch(..._args);

    trackerDep.changed();

    return result;
  };

  return newStore;
};
