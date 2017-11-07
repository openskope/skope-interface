import _ from 'lodash';
import objectPath from 'object-path';

/**
 * Restricts the scope of the reducer to a certain field in the state.
 * @param  {String} scopePath
 * @param  {Function} reducer
 * @return {Function}
 */
export const scopedReducerCreator = (scopePath, reducer) => (state, action) => {
  const newState = _.cloneDeep(state);
  const scopedState = objectPath.get(newState, scopePath);
  const newScopedState = reducer(scopedState, action);

  objectPath.set(newState, scopePath, newScopedState);

  return newState;
};
