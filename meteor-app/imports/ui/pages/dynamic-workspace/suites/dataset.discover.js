import objectPath from 'object-path';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import globalTheme from '/imports/ui/styling/muiTheme';

import TabComponentClass from './TabComponentClass';

export default
class DiscoverTab extends TabComponentClass {
  static tabLabel = 'Discover';
  static tabStyle = {
    fontSize: '1.2em',
    color: globalTheme.palette.alternateTextColor,
    backgroundColor: globalTheme.palette.primary1Color,
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

    FlowRouter.go('/discover', null, searchQuery);
  }
}
