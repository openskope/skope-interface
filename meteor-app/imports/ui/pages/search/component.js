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
      dataFilters,

      results = [],
    } = this.props;

    return (
      <div className="page--search">
        <SearchkitProvider searchkit={searchkit}>
          <Layout>
            <TopBar>
              <SearchBox
                autofocus={true}
                searchOnChange={true}
                prefixQueryFields={["actors^1","type^2","languages","title^10"]}/>
            </TopBar>
            <LayoutBody>
              <SideBar>
                <InputFilter
                  id="lastname-input"
                  title="Search by last name"
                  placeholder="Appleseed"
                  searchOnChange={true}
                  prefixQueryFields={["lastname"]}
                  queryFields={["lastname"]}
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
                    {title:"All"},
                    {title:"up to 20", from:0, to:21},
                    {title:"21 to 40", from:21, to:41},
                    {title:"41 to 60", from:41, to:61},
                    {title:"61 to 80", from:61, to:81},
                    {title:"81 to 100", from:81, to:101},
                  ]}
                />
                <RangeFilter
                  field="age"
                  id="age-range"
                  min={0}
                  max={100}
                  showHistogram={true}
                  title=""
                />
                <RefinementListFilter
                  id="employer-list"
                  title="Employer"
                  field="employer"
                  operator="OR"
                  size={5}
                />
              </SideBar>
              <LayoutResults>
                <ActionBar>

                  <ActionBarRow>
                    <HitsStats/>
                  </ActionBarRow>

                  <ActionBarRow>
                    <SelectedFilters/>
                    <ResetFilters/>
                  </ActionBarRow>

                </ActionBar>
                <Hits mod="sk-hits-grid" hitsPerPage={10} itemComponent={MovieHitsGridItem}
                  sourceFilter={["title", "poster", "imdbId"]}/>
                <NoHits/>
              </LayoutResults>
            </LayoutBody>
          </Layout>
        </SearchkitProvider>
      </div>
    );
  }
}
