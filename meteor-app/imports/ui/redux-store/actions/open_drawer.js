import PropTypes from 'prop-types';

export const OPEN_DRAWER = {
  type: 'OPEN_DRAWER',
  payloadSchema: {
    // If provided, this given value will be the final value of the state.
    overrideWith: PropTypes.bool,
  },
};
