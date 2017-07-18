import PropTypes from 'prop-types';

export const WORKSPACE_CHANGE_LAYER_OPACITY = {
  type: 'WORKSPACE_CHANGE_LAYER_OPACITY',
  payloadSchema: {
    opacity: PropTypes.number.isRequired,
  },
};
