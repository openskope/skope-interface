import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';

import globalTheme from '/imports/ui/styling/muiTheme';

import {
  NOOP,
} from '/imports/helpers/model';

const styles = {
  root: {
    // Necessary for setting border radius on root.
    overflow: 'hidden',
  },
  icon: {
    color: 'inherit',
    fill: 'currentColor',
  },
  button: {
    minWidth: false,
    height: '1.875em',
    lineHeight: '1.875em',
    backgroundColor: 'inherit',
    color: 'inherit',
    transition: false,
    // Leave the border radius up to the root container.
    borderRadius: false,
  },
  button_iconOnly: {
    paddingLeft: '0.5em',
    paddingRight: '0.5em',
  },
  button_active: {
    backgroundColor: globalTheme.palette.toggleButtonActiveBackgroundColor,
    color: globalTheme.palette.textColor,
  },
};

export default
(props) => {
  const {
    className,
    defaultZDepth = 0,
    zDepthWhenToggled = 1,
    label = '',
    icon = null,
    style = {},
    buttonStyle = {},
    toggled = false,
    onToggle = NOOP,
    ...otherProps
  } = props;

  const iconCloned = icon && React.cloneElement(icon, {
    style: {
      ...styles.icon,
      ...icon.props.style,
    },
    key: 'iconCloned',
  });

  return (
    <Paper
      className={className}
      style={{
        ...styles.root,
        ...style,
      }}
      zDepth={toggled ? zDepthWhenToggled : defaultZDepth}
    >
      <FlatButton
        {...otherProps}

        label={label}
        icon={iconCloned}

        style={{
          ...styles.button,
          ...buttonStyle,
          ...(icon && !label && styles.button_iconOnly),
          ...(toggled && styles.button_active),
        }}
        onClick={(event) => onToggle(event, !toggled)}
      />
    </Paper>
  );
};
