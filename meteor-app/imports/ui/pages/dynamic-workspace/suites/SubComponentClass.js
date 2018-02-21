export default
class SubComponent {
  // Override this.
  static propTypes = {};
  // Override this.
  static defaultProps = {};

  constructor (parentComponent, stateNamespace) {
    this._component = parentComponent;
    this._stateNs = stateNamespace || this.constructor.name;
  }

  get component () {
    return this._component;
  }

  get props () {
    return this.component.props;
  }

  get state () {
    return this.component.state[this._stateNs];
  }

  setState (newState) {
    const oldState = this.state;

    return this.component.setState({
      [this._stateNs]: {
        ...oldState,
        ...newState,
      },
    });
  }

  getInitialStateForParent () {
    return {
      [this._stateNs]: this.getInitialState(),
    };
  }

  // Override this.
  getInitialState () {
    return {};
  }
}
