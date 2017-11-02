import PropTypes from 'prop-types';

export const MODEL_UPDATE_FORM = {
  type: 'MODEL_UPDATE_FORM',
  payloadSchema: {
    values: PropTypes.object.isRequired,
  },
};
