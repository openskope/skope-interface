import { createContainer } from 'meteor/react-meteor-data';
import Component from './component';

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

  return {
    searchString,
    searchPending,
    searchResults,
  };
}, Component);
