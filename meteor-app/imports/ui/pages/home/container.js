// import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Component from './component';

export default createContainer((/* props */) => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it.

  return {
//     user: Meteor.user(),
  };
}, Component);
