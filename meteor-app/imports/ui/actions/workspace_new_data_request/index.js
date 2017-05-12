import PropTypes from "prop-types";

export const WORKSPACE_NEW_DATA_REQUEST = {
  type: "WORKSPACE_NEW_DATA_REQUEST",
  payloadSchema: {
    request: PropTypes.object.isRequired,
  },
};
