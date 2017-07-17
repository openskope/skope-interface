import { createContainer } from 'meteor/react-meteor-data';
import {
  SearchkitManager,
} from 'searchkit';

import Component from './component';

const searchkit = new SearchkitManager('http://localhost:9200/');

/** This does not work **/
// const searchkit = new SearchkitManager("http://localhost:9200/", {
//   basicAuth: "elastic:changeme",
// });

export default createContainer(() => ({
  searchkit,
}), Component);
