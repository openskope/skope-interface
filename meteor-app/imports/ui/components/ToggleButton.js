import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';

import {
  mapToolbarStyles,
} from '/imports/ui/consts';

export default
(props) => {
  const {
    icon = null,
    style = {},
    toggled = false,
    onToggle = () => {},
    ...otherProps
  } = props;

  const iconCloned = icon && React.cloneElement(icon, {
    style: {
      color: 'inherit',
      fill: 'currentColor',
      ...icon.props.style,
    },
    key: 'iconCloned',
  });

  return (
    <Paper
      style={{
        ...style,
      }}
      zDepth={toggled ? 1 : 0}
    >
      <FlatButton
        {...otherProps}

        icon={iconCloned}

        style={{
          ...mapToolbarStyles.toggleButton.button,
          ...(toggled && mapToolbarStyles.toggleButton.active),
        }}
        onClick={(event) => onToggle(event, !toggled)}
      />
    </Paper>
  );
};
