import objectPath from 'object-path';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import TabBaseClass from '../BaseClass';

export default
class DiscoverTab extends TabBaseClass {
  static tabLabel = 'Discover';
  static tabStyle = {
    fontSize: '1.2em',
  };

  onActivate () {
    /**
     * Search query state from the routing.
     * @type {Object}
     */
    const searchQuery = ((searchStateString) => {
      let searchState = null;

      try {
        searchState = JSON.parse(searchStateString);
      } catch (e) {}

      return searchState;
    })(objectPath.get(this.props, 'routing.queryParams.q'));

    const url = FlowRouter.path('/discover', null, searchQuery);

    location.href = url;
  }
}
