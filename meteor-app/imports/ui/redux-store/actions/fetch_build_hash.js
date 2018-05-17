import PropTypes from 'prop-types';

export const FETCH_BUILD_HASH = {
  type: 'FETCH_BUILD_HASH',
  payloadSchema: {
    hash: PropTypes.string.isRequired,
  },
};
