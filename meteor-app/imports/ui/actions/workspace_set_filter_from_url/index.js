import PropTypes from 'prop-types';

export const WORKSPACE_SET_FILTER_FROM_URL = {
  type: 'WORKSPACE_SET_FILTER_FROM_URL',
  payloadSchema: {
    value: PropTypes.string,
  },
};
