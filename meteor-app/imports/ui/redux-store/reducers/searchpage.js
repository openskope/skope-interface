/**
 * These are reducers for the search page.
 */

import {
  scopedReducerCreator,
} from '/imports/ui/redux-store/helpers';

/**
 * Restricts the scope of the reducer to a certain field in the state.
 * @param  {Function} reducer
 * @return {Function}
 */
const scopedReducer = (reducer) => scopedReducerCreator('search', reducer);

/**
 * This reducer saves the search results from SearchKit into the state.
 */
export const SEARCH_UPDATE_RESULT = scopedReducer((searchpage, action) => ({
  ...searchpage,
  searchResult: action.result,
}));
