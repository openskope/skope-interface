import { FlowRouter } from "meteor/kadira:flow-router";
import React from 'react';

class SearchResultItem extends React.Component {
  render () {
    return (
      <div>Some Result (Implement this)</div>
    );
  }
}

export default class Page_Search extends React.Component {
  render () {
    const {
      results = [],
    } = this.props;

    return (
      <div className="page--search">
        <div className="row_1">
          <label>Search:</label>
          <input className="flex-fill" type="text" />
          <button>Go!</button>
        </div>

        <div className="row_2">
          <aside className="box search_filters">
            <div className="box_body">
              <div className="filter-section">
                <div className="filter-section__title">Models</div>
                <ul>
                  <li><input type="checkbox" /><label>PaleoCAR (1)</label></li>
                  <li><input type="checkbox" /><label>Model 2 (3)</label></li>
                  <li><input type="checkbox" /><label>Model 3 (2)</label></li>
                </ul>
              </div>
              <div className="filter-section">
                <div className="filter-section__title">Data Type</div>
                <ul>
                  <li><input type="checkbox" /><label>Temperature (1)</label></li>
                  <li><input type="checkbox" /><label>Precipitation (3)</label></li>
                  <li><input type="checkbox" /><label>Maize niche (2)</label></li>
                </ul>
              </div>
              <div className="filter-section">
                <div className="filter-section__title">Data Source</div>
                <ul>
                  <li><input type="checkbox" /><label>Peer-reviewd Article (1)</label></li>
                  <li><input type="checkbox" /><label>SKOPE user-generated (3)</label></li>
                </ul>
              </div>
            </div>
          </aside>
          <main className="box search_results">
            <div className="box_body">
              {results.map((item, index) => (
                <SearchResultItem key={index} {...item} />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }
}
