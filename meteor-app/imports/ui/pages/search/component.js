import React from 'react';
import PropTypes from 'prop-types';

import {
  SearchkitManager,
  SearchkitProvider,
  Pagination,
  SearchBox,
  RefinementListFilter,
  NumericRefinementListFilter,
  RangeFilter,
  LayoutResults,
  InputFilter,
  ActionBar,
  ActionBarRow,
  HitsStats,
  SelectedFilters,
  ResetFilters,
  Hits,
  NoHits,
} from 'searchkit';
import '/node_modules/searchkit/release/theme.css';

class SearchResultItem extends React.Component {
  render () {
    return (
      <div style={{ overflow: 'auto' }}>
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
  };

  render () {
    const {
      searchkit,
    } = this.props;

    return (
      <SearchkitProvider searchkit={searchkit}>
        <div className="page--search">
          <div className="page--search__sidepanel">
            <InputFilter
              id="lastname-input"
              title="Search by last name"
              placeholder="Appleseed"
              searchOnChange
              prefixQueryFields={['lastname']}
              queryFields={['lastname']}
            />
            <RefinementListFilter
              id="state-list"
              title="State"
              field="state"
              operator="OR"
              size={5}
            />
            <NumericRefinementListFilter
              id="age-refine"
              title="Age Groups"
              field="age"
              options={[
                { title: 'All' },
                { title: 'up to 20', from: 0, to: 21 },
                { title: '21 to 40', from: 21, to: 41 },
                { title: '41 to 60', from: 41, to: 61 },
                { title: '61 to 80', from: 61, to: 81 },
                { title: '81 to 100', from: 81, to: 101 },
              ]}
            />
            <RangeFilter
              field="age"
              id="age-range"
              min={0}
              max={100}
              showHistogram
              title=""
            />
            <RefinementListFilter
              id="employer-list"
              title="Employer"
              field="employer"
              operator="OR"
              size={5}
            />
          </div>

          <div className="page--search__searchpanel">

            <SearchBox
              autofocus
              searchOnChange
              prefixQueryFields={['actors^1', 'type^2', 'languages', 'title^10']}
            />

            <LayoutResults>
              <ActionBar>

                <ActionBarRow>
                  <HitsStats />
                </ActionBarRow>

                <ActionBarRow>
                  <SelectedFilters />
                  <ResetFilters />
                </ActionBarRow>

              </ActionBar>
              <Hits mod="sk-hits-grid" hitsPerPage={10} itemComponent={SearchResultItem} />
              <NoHits />

              <Pagination
                showNumbers
              />
            </LayoutResults>

          </div>
        </div>
      </SearchkitProvider>
    );
  }
}
