import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import React from 'react';

export default () => (
  <div id="not-found" className="page--not_found">
    <div className="not-found-image">
      <img src={FlowRouter.url('/img/404.svg')} alt="" />
    </div>
    <div className="not-found-title">
      <h1>Sorry, that page doesn’t exist</h1>
      <a href={FlowRouter.path('/')} className="gotohomepage">Go to home</a>
    </div>
  </div>
);
