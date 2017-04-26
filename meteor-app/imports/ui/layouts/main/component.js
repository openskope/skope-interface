import React from "react";

import Navbar from "/imports/ui/components/navbar/component";

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
          Some footer
        </div>
      </div>
    );
  }
}
