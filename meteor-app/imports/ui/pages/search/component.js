import React from 'react';
import PropTypes from 'prop-types';

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
      searchString,
      searchPending,
      dataFilters,

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
                <div className="box_body">{dataFilters.map((filter, filterIndex) => (
                  <div
                    key={filterIndex}
                    className="filter-section"
                  >
                    <div className="filter-section__title">{filter.title}</div>
                    <ul>{filter.items.map((filterItem, filterItemIndex) => (
                      <li key={filterItemIndex}>
                        <input type="checkbox" />
                        <label>{filterItem.title} ({filterItem.count})</label>
                      </li>
                    ))}</ul>
                  </div>
                ))}</div>
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
