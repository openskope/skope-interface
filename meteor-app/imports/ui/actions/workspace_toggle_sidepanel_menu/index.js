import PropTypes from 'prop-types';

export const WORKSPACE_TOGGLE_PANEL_MENU = {
    type: 'WORKSPACE_TOGGLE_PANEL_MENU',
    payloadSchema: {
        index: PropTypes.number.isRequired,
    },
};