import PropTypes from 'prop-types';

export
const WORKSPACE_RESOLVE_DATASET_DATA = {
  type: 'WORKSPACE_RESOLVE_DATASET_DATA',
  payloadSchema: {
    datasetId: PropTypes.string.isRequired,
    requestId: PropTypes.string.isRequired,
    error: PropTypes.object,
    data: PropTypes.object,
  },
};

export
const WORKSPACE_LOAD_DATASET = {
  type: 'WORKSPACE_LOAD_DATASET',
  payloadSchema: {
    datasetId: PropTypes.string.isRequired,
  },
};
