import PropTypes from 'prop-types';

export const CHARTS_INSPECT_POINT_INIT_REQUEST = {
  type: 'CHARTS_INSPECT_POINT_INIT_REQUEST',
  payloadSchema: {
    coordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
    requestId: PropTypes.string.isRequired,
  },
};

export const CHARTS_INSPECT_POINT_RESOLVE_DATA = {
  type: 'CHARTS_INSPECT_POINT_RESOLVE_DATA',
  payloadSchema: {
    error: PropTypes.instanceOf(Error),
    result: PropTypes.shape({
      data: PropTypes.any.isRequired,
      requestId: PropTypes.string.isRequired,
    }).isRequired,
  },
};

export const CHARTS_INSPECT_POINT_CLEAR_DATA = {
  type: 'CHARTS_INSPECT_POINT_CLEAR_DATA',
};

export const CHARTS_SET_FILTERS = {
  type: 'CHARTS_SET_FILTERS',
  payloadSchema: {
    value1: PropTypes.number,
    value2: PropTypes.number,
  },
};
