/**
 * This is a styleless pure layout component.
 * It is used and styled by other components.
 */

import React from 'react';
import {
  getClassName,
} from '/imports/ui/helpers';

export default ({
  className = '',
  header,
  body,
  footer,
}) => (
  <div className={getClassName('layout', className)}>
    <div className="layout__header">{header}</div>
    <div className="layout__body">{body}</div>
    <div className="layout__footer">{footer}</div>
  </div>
);
