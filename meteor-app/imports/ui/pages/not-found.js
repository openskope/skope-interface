import React from 'react';
import FixedWidthLayout from '/imports/ui/layouts/fixed-width';
import AppbarHeader from '/imports/ui/components/appbar';

import {
  absoluteUrl,
} from '/imports/ui/helpers';

const renderHeader = () => (
  <AppbarHeader />
);

const renderBody = () => (
  <div id="not-found" className="page--not_found">
    <div className="not-found-image">
      <img src={absoluteUrl('/img/404.svg')} alt="" />
    </div>
    <div className="not-found-title">
      <h1>Sorry, that page doesn’t exist</h1>
      <a href={absoluteUrl('/')} className="gotohomepage">Go to home</a>
    </div>
  </div>
);

export default () => (
  <FixedWidthLayout
    header={renderHeader()}
    body={renderBody()}
  />
);
