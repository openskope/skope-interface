/**
 * This is a base class for components that are part of a parent component,
 * shares the same props of the parent component and stores state in that
 * parent component.
 */

import _ from 'lodash';

export default
class SubComponent {
  // Override this.
  static propTypes = {};
  // Override this.
  static defaultProps = {};

  constructor (parentComponent, stateNamespace) {
    this._component = parentComponent;
    this._stateNs = stateNamespace || this.constructor.name;
    /**
     * This is used to avoid multiple calls to `.setState` getting the same current state,
     * since `.setState` doesn't update `.state` immediately.
     */
    this._statePhantom = {};
    this._statePhantomBase = null;
    this._sharedStatePhantom = {};
    this._sharedStatePhantomBase = null;
  }

  get name () {
    return this._stateNs;
  }

  get component () {
    return this._component;
  }

  get props () {
    return this.component.props;
  }

  get state () {
    return this.component.state[this.name] || {};
  }

  get sharedState () {
    return this.component.state._shared || {};
  }

  setState (newState) {
    // During one update cycle, multiple calls to `.setState` see the same state object.
    if (this._statePhantomBase !== this.state) {
      this._statePhantomBase = this.state;
      this._statePhantom = _.cloneDeep(this.state);
    }

    _.merge(this._statePhantom, newState);

    return this.component.setState({
      [this.name]: _.cloneDeep(this._statePhantom),
    });
  }

  setSharedState (newSharedState) {
    // During one update cycle, multiple calls to `.setState` see the same state object.
    if (this._sharedStatePhantomBase !== this.sharedState) {
      this._sharedStatePhantomBase = this.sharedState;
      this._sharedStatePhantom = _.cloneDeep(this.sharedState);
    }

    _.merge(this._sharedStatePhantom, newSharedState);

    return this.component.setState({
      _shared: _.cloneDeep(this._sharedStatePhantom),
    });
  }

  getInitialStateForParent () {
    return {
      _shared: this.getInitialSharedState(),
      [this.name]: this.getInitialState(),
    };
  }

  // Override this.
  getInitialState () {
    return {};
  }

  // Override this.
  getInitialSharedState () {
    return {};
  }
}
