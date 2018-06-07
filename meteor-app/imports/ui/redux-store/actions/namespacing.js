import PropTypes from 'prop-types';

export
const NAMESPACE_SET_STATE = {
  type: 'NAMESPACE_SET_STATE',
  payloadSchema: {
    namespacePath: PropTypes.string.isRequired,
    state: PropTypes.object.isRequired,
    options: PropTypes.shape({
      reset: PropTypes.bool,
    }),
  },
};
