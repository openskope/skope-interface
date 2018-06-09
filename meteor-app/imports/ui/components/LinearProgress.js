import React from 'react';
import classNames from '@xch/class-names';

export
const IndeterminateProgress = (props) => (
  <div
    className={classNames(
      'linear-progress',
      {
        'linear-progress--paused': props.paused,
      },
    )}
  />
);
