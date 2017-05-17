/**
 * These are reducers for the search page.
 */

import { filterMax } from "/imports/ui/consts";

/**
 * This reducer is used when search input is changed in search page.
 */
export const SEARCH_SET_INPUT_FROM_URL = (state, action) => {
  const {
    value,
  } = action;
  const inputString = typeof value === "undefined" ? "" : String(value).trim();

  if (state.search.input !== inputString) {
    return {
      ...state,

      search: {
        ...state.search,

        input: inputString,
        pending: true,
        results: null,
      },
    };
  } else {
    return state;
  }
};

/**
 * This reducer is used when the data is ready for the search page.
 */
export const SEARCH_RESOLVE_DATA = (state, action) => {
  const {
    input,
    error,
    result,
  } = action;

  if (state.search.input === input && state.search.pending) {
    return {
      ...state,

      search: {
        ...state.search,

        pending: false,
        results: result,
      },
    };
  } else {
    return state;
  }
};

