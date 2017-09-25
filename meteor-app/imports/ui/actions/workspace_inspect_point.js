import PropTypes from 'prop-types';

export const WORKSPACE_INSPECT_POINT = {
  type: 'WORKSPACE_INSPECT_POINT',
  payloadSchema: {
    selected: PropTypes.bool.isRequired,
    coordinate: PropTypes.arrayOf(PropTypes.number),
  },
};
