import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import globalTheme from '/imports/ui/styling/muiTheme';


import {
  getCurrentRoute,
} from '/imports/ui/helpers';

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
    const searchStateString = getCurrentRoute().queryParams.q;
    let searchState = {};

    try {
      searchState = JSON.parse(searchStateString);
    } catch (e) {}

    FlowRouter.go('/explore', null, searchState);
  }
}
