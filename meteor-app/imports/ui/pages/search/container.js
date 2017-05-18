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
  let results = [];

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

    // De-reference data items.
    const dataFilterMapping = searchResults["data-filters"].reduce((acc, filterDef) => ({
      ...acc,
      [filterDef.property]: filterDef,
    }), {});

    results = searchResults.data.map((dataItem) => Object.keys(dataItem).reduce((acc, key) => ({
      ...acc,
      [key]: (key in dataFilterMapping) ? searchResults[dataFilterMapping[key].definitions][dataItem[key]] : dataItem[key],
    }), {}));
  }

  return {
    searchString,
    searchPending,
    searchResults,
    dataFilters,
    results,
  };
}, Component);
