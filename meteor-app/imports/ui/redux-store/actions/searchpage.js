/**
 * These are actions for the search page.
 */

import PropTypes from 'prop-types';

export const SEARCH_SET_INPUT_FROM_URL = {
  type: 'SEARCH_SET_INPUT_FROM_URL',
  payloadSchema: {
    value: PropTypes.string,
  },
};

export const SEARCH_RESOLVE_DATA = {
  type: 'SEARCH_RESOLVE_DATA',
  payloadSchema: {
    input: PropTypes.string,
    error: PropTypes.instanceOf(Error),
    result: PropTypes.object.isRequired,
  },
};

export const SEARCH_UPDATE_RESULT = {
  type: 'SEARCH_UPDATE_RESULT',
  payloadSchema: {
    result: PropTypes.object.isRequired,
  },
};
