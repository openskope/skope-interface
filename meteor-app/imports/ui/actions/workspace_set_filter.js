import PropTypes from 'prop-types';

export const WORKSPACE_SET_FILTER = {
  type: 'WORKSPACE_SET_FILTER',
  payloadSchema: {
    value: PropTypes.number,
  },
};
