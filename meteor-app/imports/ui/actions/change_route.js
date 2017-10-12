import PropTypes from 'prop-types';

export const CHANGE_ROUTE = {
  type: 'CHANGE_ROUTE',
  payloadSchema: {
    // The new route path to change to.
    path: PropTypes.string.isRequired,
  },
};
