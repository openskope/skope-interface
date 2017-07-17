import PropTypes from 'prop-types';

export const WORKSPACE_INSPECT_POINT_RESOLVE_DATA = {
  type: 'WORKSPACE_INSPECT_POINT_RESOLVE_DATA',
  payloadSchema: {
    coordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
    error: PropTypes.instanceOf(Error),
    result: PropTypes.any.isRequired,
  },
};
