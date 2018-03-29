import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import TabComponentClass from './TabComponentClass';

export default
class DiscoverTab extends TabComponentClass {
  static tabLabel = 'Discover';

  onActivate () {
    //! Todo: append search state in url.
    FlowRouter.go('/explore');
  }
}
