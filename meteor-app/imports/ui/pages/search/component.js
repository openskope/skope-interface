import React from 'react';
import PropTypes from 'prop-types';

import {
  SearchkitManager,
  SearchkitProvider,
  Layout,
  TopBar,
  SearchBox,
  LayoutBody,
  SideBar,
  HierarchicalMenuFilter,
  RefinementListFilter,
  LayoutResults,
  ActionBar,
  ActionBarRow,
  HitsStats,
  SelectedFilters,
  ResetFilters,
  MovieHitsGridItem,
  Hits,
  NoHits,
} from "searchkit";
import "searchkit/release/theme.css";

class SearchResultItem extends React.Component {
  render () {
    return (
      <div style={{overflow: "auto"}}>
        <p>Some Result (Implement this)</p>
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
      </div>
    );
  }
}

export default class SearchPage extends React.Component {

  static propTypes = {
    // SearchKit Manager instance.
    searchkit: PropTypes.instanceOf(SearchkitManager),
    // Callback function for updating search input.
    updateSearchInput: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_searchButtonOnClick = this._searchButtonOnClick.bind(this);
  }

  _searchButtonOnClick (/* event */) {
    if (this.inputField_) {
      const inputValue = this.inputField_.value;
      const {
        updateSearchInput,
      } = this.props;

      updateSearchInput(inputValue);
    }
  }

  render () {
    const {
      searchkit,

      searchString,
      searchPending,

      results = [],
    } = this.props;

    return (
      <div className="page--search">
        <div className="row_1">
          <label>Search:</label>
          <input
            className="flex-fill"
            type="text"
            defaultValue={searchString}
            ref={ref => this.inputField_ = ref}
          />
          <button onClick={this._bound_searchButtonOnClick}>Go!</button>
        </div>

        {
          searchPending
          ?
            <div className="row_2">Searching...</div>
          :
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
        }
      </div>
    );
  }
}
