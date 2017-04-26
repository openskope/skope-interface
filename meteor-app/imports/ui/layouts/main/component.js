import React from "react";

import Navbar from "/imports/ui/components/navbar/component";

import {
  demo_repository,
} from "/package.json";

export default class Layout_Main extends React.Component {
  render() {
    const {
      navInfo,
      body,
    } = this.props;
    return (
      <div className="page">
        <div className="page__header">
          <p>Some header</p>
          <Navbar items={navInfo} />
        </div>
        <div className="page__body">
          {body}
        </div>
        <div className="page__footer">
          <p>Some footer</p>
          <p><a href={demo_repository} target="_blank">Source code on Github</a></p>
        </div>
      </div>
    );
  }
}
