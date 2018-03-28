export default
class SubComponent {
  // Override this.
  static propTypes = {};
  // Override this.
  static defaultProps = {};

  constructor (parentComponent, stateNamespace) {
    this._component = parentComponent;
    this._stateNs = stateNamespace || this.constructor.name;
    // This is used to avoid multiple calls to `setState` getting the same current state.
    this._statePhantom = {};
    this._statePhantomBase = null;
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
    return this.component.state[this.name];
  }

  setState (newState) {
    // During one update cycle, multiple calls to `setState` see the same state object.
    if (this._statePhantomBase !== this.state) {
      this._statePhantomBase = this.state;
      this._statePhantom = { ...this.state };
    }

    this._statePhantom = {
      ...this._statePhantom,
      ...newState,
    };

    return this.component.setState({
      [this.name]: { ...this._statePhantom },
    });
  }

  getInitialStateForParent () {
    return {
      [this.name]: this.getInitialState(),
    };
  }

  // Override this.
  getInitialState () {
    return {};
  }
}
