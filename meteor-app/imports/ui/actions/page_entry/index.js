import PropTypes from 'prop-types';

export const PAGE_ENTRY = {
  type: 'PAGE_ENTRY',
  payloadSchema: {
    path: PropTypes.string.isRequired,
  },
};
