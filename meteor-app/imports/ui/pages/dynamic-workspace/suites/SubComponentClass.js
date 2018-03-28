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
    const oldState = this.state;

    return this.component.setState({
      [this.name]: {
        ...oldState,
        ...newState,
      },
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
