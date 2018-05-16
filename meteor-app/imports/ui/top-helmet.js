/**
 * This component should be included in every route.
 * It should include common header elements that are used in every route.
 */

import React from 'react';
import { Helmet } from 'react-helmet';

import {
  absoluteUrl,
} from '/imports/helpers/ui/routing';

export default
() => (
  <Helmet>
    <link rel="icon" href={absoluteUrl('favicon.ico')} />
  </Helmet>
);
