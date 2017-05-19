import React from "react";
import PropTypes from "prop-types";

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

const searchkit = new SearchkitManager("http://demo.searchkit.co/api/movies/");

const App = ()=> (
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
          <HierarchicalMenuFilter
            fields={["type.raw", "genres.raw"]}
            title="Categories"
            id="categories"/>
          <RefinementListFilter
            id="actors"
            title="Actors"
            field="actors.raw"
            operator="AND"
            size={10}/>
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
);

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

export default class Page_Search extends React.Component {

  static propTypes = {
    // Callback function for updating search input.
    updateSearchInput: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    this._bound_searchButtonOnClick = this._searchButtonOnClick.bind(this);
  }

  _searchButtonOnClick (event) {
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
      searchResults,
      dataFilters,

      results = [],
    } = this.props;

    return (
      <div className="page--search">
        <App />
      </div>
    );
  }
}
