import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import React from 'react';
import { Button } from 'muicss/react';

export default class HomePage extends React.Component {
  render() {
    return (
      <div className="page--home">
        <div className="row_1">
          <div className="box">
            <div className="box_body">
              Find and download paleoenvironmental data!
              <br></br>
              <a href={FlowRouter.url('/search')}>
              <button className="mdc-button mdc-button--accent">Search</button>
              </a>
            </div>
          </div>
          <div className="box">
            <div className="box_body">
              Compare and compute paleoenvironmental reconstructions!
              <br></br>
              <a href={FlowRouter.url('/workspace')}>
                <button className="mdc-button mdc-button--accent">Workspace</button>
              </a>
            </div>
          </div>
          <div className="box">
            <div className="box_body">
              Contribute your paleoenvironmental model!
              <br></br>
              <a href={FlowRouter.url('/model')}>
                <button className="mdc-button mdc-button--accent">Model</button>
              </a>
            </div>
          </div>
        </div>

        <div className="row_2">
          <p>
            <b>Welcome to SKOPE: Synthesizing Knowledge of Past Environments!</b>
          </p>
          <p>
            SKOPE allows you to discover, examine, and download paleoenvironmental data:
          </p>
        </div>

        <div className="row_3">
          <div className="box">
            <div className="box_body">
              Some Data
            </div>
          </div>
          <div className="box">
            <div className="box_body">
              Some Data
            </div>
          </div>
          <div className="box">
            <div className="box_body">
              Some Data
            </div>
          </div>
          <div className="box">
            <div className="box_body">
              Some Data
            </div>
          </div>
        </div>
      </div>
    );
  }
}
