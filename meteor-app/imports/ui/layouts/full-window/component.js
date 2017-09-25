import React from 'react';
import Navbar from '/imports/ui/components/navbar/container';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import {
  demoRepository,
} from '/package.json';

export default class FullWindowLayout extends React.Component {
  render() {
    const {
      store,
      body,
      helpUrl,
    } = this.props;

    return (
      <div className="page layout-fullWindow">
        <div className="page__header">
          <img src={FlowRouter.url('/img/header.jpg')} alt="" />
        </div>

        <div className="mdc-toolbar">
          <div className="mdc-toolbar__row">
            <section className="mdc-toolbar__section">

              <div className="mdc-menu-anchor">
                <a href="https://www.openskope.org/"><span className="mdc-toolbar__title">What is SKOPE?</span></a>
                <div className="mdc-simple-menu" tabIndex={-1}>
                  <ul className="mdc-simple-menu__items mdc-list" role="menu" aria-hidden={true}>
                    <a href="https://www.openskope.org/skope-nsf-proposal">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>SKOPE NSF Proposal</li>
                    </a>
                    <a href="https://www.openskope.org/skope-prototype">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>SKOPE Prototype</li>
                    </a>
                    <a href="https://www.openskope.org/sample-questions-of-the-sort-skope-plans-to-address">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Stories</li>
                    </a>
                  </ul>
                </div>
              </div>

              <div className="mdc-menu-anchor">
                <a href="https://www.openskope.org/environmental-information"><span className="mdc-toolbar__title">Environmental Data</span></a>
                <div className="mdc-simple-menu" tabIndex={-1}>
                  <ul className="mdc-simple-menu__items mdc-list" role="menu" aria-hidden={true}>
                    <a href="https://www.openskope.org/feddata">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>FedData</li>
                    </a>
                    <a href="https://www.openskope.org/paleoenvironmental-reconstruction-paleocar">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>PaleoCAR</li>
                    </a>
                    <a href="https://www.openskope.org/risk-landscapes">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Risk Landscapes</li>
                    </a>
                    <a href="https://www.openskope.org/skope-prototype">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>SKOPE Prototype</li>
                    </a>
                    <a href="https://www.openskope.org/environmental-data-climate-reconstruction-resources">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Web Resources</li>
                    </a>
                  </ul>
                </div>
              </div>

              <div className="mdc-menu-anchor">
                <a href="https://www.openskope.org/provenance"><span className="mdc-toolbar__title">Provenance</span></a>
                <div className="mdc-simple-menu" tabIndex={-1}>
                  <ul className="mdc-simple-menu__items mdc-list" role="menu" aria-hidden={true}>
                    <a href="https://www.openskope.org/yesworkflow">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>YesWorkflow</li>
                    </a>
                  </ul>
                </div>
              </div>

              <div className="mdc-menu-anchor">
                <a href="https://www.openskope.org/data-integration"><span className="mdc-toolbar__title">Data Integration</span></a>
              </div>

              <div className="mdc-menu-anchor">
                <a href="https://www.openskope.org/skope-prototype"><span className="mdc-toolbar__title">SKOPE Prototype</span></a>
                <div className="mdc-simple-menu" tabIndex={-1}>
                  <ul className="mdc-simple-menu__items mdc-list" role="menu" aria-hidden={true}>
                    <a href={FlowRouter.url('/search')}>
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Search</li>
                    </a>
                    <a href={FlowRouter.url('/model')}>
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Model: PaleoCAR</li>
                    </a>
                    <a href={FlowRouter.url('/workspace')}>
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Workspace</li>
                    </a>
                    <a href="https://www.openskope.org/skope-prototype-users-guide">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Prototype User's Guide</li>
                    </a>
                  </ul>
                </div>
              </div>

              <div className="mdc-menu-anchor">
                <span className="mdc-toolbar__title">Products</span>
                <div className="mdc-simple-menu" tabIndex={-1}>
                  <ul className="mdc-simple-menu__items mdc-list" role="menu" aria-hidden={true}>
                    <a href="https://www.openskope.org/publications">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Publications</li>
                    </a>
                    <a href="https://www.openskope.org/presentations">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>Presentations</li>
                    </a>
                    <a href="https://www.openskope.org/skope-prototype">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>SKOPE Prototype</li>
                    </a>
                    <a href="https://www.openskope.org/yesworkflow">
                      <li className="mdc-list-item" role="menuitem" tabIndex={0}>YesWorkflow</li>
                    </a>
                  </ul>
                </div>
              </div>

              <div className="mdc-menu-anchor">
                <a href="https://www.openskope.org/skope-contact-information"><span className="mdc-toolbar__title">SKOPE Team</span></a>
              </div>

            </section>
          </div>
        </div>

        <div className="page__body">
          {body}
        </div>
        <div className="page__footer">
          <a href={helpUrl}>
            <button className="mdc-button">Help</button>
          </a>
          <a href={demoRepository} target="_blank">Source code on Github</a>
        </div>
      </div>
    );
  }
}
