import PropTypes from 'prop-types';

export const CHARTS_SET_FILTERS = {
  type: 'CHARTS_SET_FILTERS',
  payloadSchema: {
    value1: PropTypes.number,
    value2: PropTypes.number,
  },
};
