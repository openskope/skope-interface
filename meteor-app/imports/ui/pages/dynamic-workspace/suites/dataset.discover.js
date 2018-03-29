import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import TabComponentClass from './TabComponentClass';

export default
class DiscoverTab extends TabComponentClass {
  static tabLabel = 'Discover';

  get tabStyle () {
    return {
      fontSize: '1.2em',
      color: this.props.muiTheme.palette.alternateTextColor,
      backgroundColor: this.props.muiTheme.palette.primary1Color,
    };
  }

  onActivate () {
    //! Todo: append search state in url.
    FlowRouter.go('/explore');
  }
}
