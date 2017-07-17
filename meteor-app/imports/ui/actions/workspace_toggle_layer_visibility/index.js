import PropTypes from 'prop-types';

export const WORKSPACE_TOGGLE_LAYER_VISIBILITY = {
  type: 'WORKSPACE_TOGGLE_LAYER_VISIBILITY',
  payloadSchema: {
    index: PropTypes.number.isRequired,
  },
};
