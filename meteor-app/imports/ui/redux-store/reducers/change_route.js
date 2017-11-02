/**
 * Warning! This reducer has side effects.
 */

import _ from 'lodash';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

export const CHANGE_ROUTE = (state, { path }) => {
  //! Big side effect here!
  _.defer(() => FlowRouter.go(path));

  return state;
};
