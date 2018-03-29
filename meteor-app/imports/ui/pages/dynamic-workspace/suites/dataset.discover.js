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
    //! Todo: append search state in url.
    FlowRouter.go('/explore');
  }
}
