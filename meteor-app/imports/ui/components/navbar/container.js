import { createContainer } from 'meteor/react-meteor-data';
import Component from './component';

export default createContainer(({ store }) => {
  const {
    navInfo,
  } = store.getState();

  return {
    items: navInfo,
  };
}, Component);
