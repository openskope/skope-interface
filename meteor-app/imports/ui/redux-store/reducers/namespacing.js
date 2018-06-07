import _ from 'lodash';
import objectPath from 'object-path';

export
const NAMESPACE_SET_STATE = (state, action) => {
  const {
    namespacePath,
    state: newNamespaceState,
    options = {},
  } = action;

  const newState = _.cloneDeep(state);

  if (options.reset) {
    // Reset removes the existing states.

    objectPath.set(newState, namespacePath, newNamespaceState);
  } else {
    // Mimic the same behavior of `React.Component.prototype.setState`,
    // which is merging states at root level.

    const namespaceState = objectPath.get(state, namespacePath);
    const mergedNamespaceState = {
      ...namespaceState,
      ...newNamespaceState,
    };

    objectPath.set(newState, namespacePath, mergedNamespaceState);
  }

  return newState;
};
