import PropTypes from 'prop-types';

export const WORKSPACE_CHANGE_LAYER_OPACITY = {
  type: 'WORKSPACE_CHANGE_LAYER_OPACITY',
  payloadSchema: {
    index: PropTypes.number.isRequired,
    opacity: PropTypes.number.isRequired,
  },
};

export const WORKSPACE_INSPECT_POINT = {
  type: 'WORKSPACE_INSPECT_POINT',
  payloadSchema: {
    selected: PropTypes.bool.isRequired,
    coordinate: PropTypes.arrayOf(PropTypes.number),
  },
};

export const WORKSPACE_SET_FILTER = {
  type: 'WORKSPACE_SET_FILTER',
  payloadSchema: {
    value: PropTypes.number,
  },
};

export const WORKSPACE_TOGGLE_LAYER_VISIBILITY = {
  type: 'WORKSPACE_TOGGLE_LAYER_VISIBILITY',
  payloadSchema: {
    index: PropTypes.number.isRequired,
  },
};

export const WORKSPACE_TOGGLE_PANEL_MENU = {
  type: 'WORKSPACE_TOGGLE_PANEL_MENU',
  payloadSchema: {
    index: PropTypes.number.isRequired,
  },
};

export const WORKSPACE_TOGGLE_TOOLBAR_MENU = {
  type: 'WORKSPACE_TOGGLE_TOOLBAR_MENU',
};

export const WORKSPACE_TOGGLE_WELCOME_WINDOW = {
  type: 'WORKSPACE_TOGGLE_WELCOME_WINDOW',
};
