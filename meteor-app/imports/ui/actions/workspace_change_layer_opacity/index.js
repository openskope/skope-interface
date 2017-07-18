import PropTypes from 'prop-types';

export const WORKSPACE_CHANGE_LAYER_OPACITY = {
  type: 'WORKSPACE_CHANGE_LAYER_OPACITY',
  payloadSchema: {
    index: PropTypes.number.isRequired,
    opacity: PropTypes.number.isRequired,
  },
};
