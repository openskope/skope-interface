WORKSPACE_RESOLVE_DATA_REQUEST

import PropTypes from "prop-types";

export const WORKSPACE_RESOLVE_DATA_REQUEST = {
  type: "WORKSPACE_RESOLVE_DATA_REQUEST",
  payloadSchema: {
    request: PropTypes.object.isRequired,
    error: PropTypes.object,
    result: PropTypes.object,
  },
};
