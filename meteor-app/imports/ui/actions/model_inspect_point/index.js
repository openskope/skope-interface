import PropTypes from 'prop-types';

export const MODEL_INSPECT_POINT = {
  type: 'MODEL_INSPECT_POINT',
  payloadSchema: {
    selected: PropTypes.bool.isRequired,
    coordinate: PropTypes.arrayOf(PropTypes.number),
  },
};
