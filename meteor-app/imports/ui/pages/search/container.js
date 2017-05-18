import _ from "lodash";
import { createContainer } from "meteor/react-meteor-data";
import Component from "./component";

export default createContainer((props) => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it.

  const {
    store,
  } = props;
  const {
    search: {
      input: searchString,
      pending: searchPending,
      results: searchResults,
    },
  } = store.getState();

  let dataFilters = [];

  if (searchResults) {
    // Generate filter options.
    dataFilters = searchResults["data-filters"].map((filterDef) => ({
      title: filterDef.title,
      property: filterDef.property,
      items: Object.keys(searchResults[filterDef.definitions]).map((itemKey) => ({
        ...(_.cloneDeep(searchResults[filterDef.definitions][itemKey])),
        id: itemKey,
        count: searchResults.data.filter((item) => (filterDef.property in item) && (item[filterDef.property] === itemKey)).length,
      })),
    }));

    console.info(dataFilters);
  }

  return {
    searchString,
    searchPending,
    searchResults,
    dataFilters,
    results: searchResults ? searchResults.data : [],
  };
}, Component);
