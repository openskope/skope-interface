import { createContainer } from 'meteor/react-meteor-data';
import Component from './component';

export default createContainer((props) => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it.
  const {
    store,
  } = props;
  const {
    helpUrl,
  } = store.getState();

  return {
    helpUrl,
  };
}, Component);
