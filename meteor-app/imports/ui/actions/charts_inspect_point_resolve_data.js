import PropTypes from 'prop-types';

export const CHARTS_INSPECT_POINT_RESOLVE_DATA = {
  type: 'CHARTS_INSPECT_POINT_RESOLVE_DATA',
  payloadSchema: {
    coordinate: PropTypes.arrayOf(PropTypes.number),
    error: PropTypes.instanceOf(Error),
    result: PropTypes.any.isRequired,
  },
};
