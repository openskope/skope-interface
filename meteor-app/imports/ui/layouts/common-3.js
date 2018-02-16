/**
 * This is a styleless pure layout component.
 * It is used and styled by other components.
 */

import React from 'react';
import classNames from '@xch/class-names';

export default ({
  className = '',
  header,
  body,
  footer,
}) => (
  <div className={classNames('layout', className)}>
    <div className="layout__header">{header}</div>
    <div className="layout__body">{body}</div>
    <div className="layout__footer">{footer}</div>
  </div>
);
