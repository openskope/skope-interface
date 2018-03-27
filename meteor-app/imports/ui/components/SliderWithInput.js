import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import TextField from 'material-ui/TextField';

class LazyTextField extends React.Component {
  static propTypes = {
    ...TextField.propTypes,
    onStepDown: PropTypes.func,
    onStepUp: PropTypes.func,
  };

  static defaultProps = {
    onStepDown: () => {},
    onStepUp: () => {},
  };

  constructor (props) {
    super(props);

    this.state = {
      dirtyInputValue: props.value,
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.state.dirtyInputValue) {
      this.setState({
        dirtyInputValue: nextProps.value,
      });
    }
  }

  /**
   * @param {string} specificValue - Optional.
   */
  resetValue (specificValue) {
    const newValue = typeof specificValue === 'undefined'
                     ? this.props.value
                     : specificValue;
    this.setState({
      dirtyInputValue: newValue,
    });
  }

  flushValue (event) {
    this.props.onChange(event, this.state.dirtyInputValue);
  }

  inputOnChange = (event, newValue) => {
    this.setState({
      dirtyInputValue: newValue,
    });
  };

  inputOnKeyDown = (event) => {
    switch (true) {
      case event.keyCode === 13 && !event.altKey && !event.ctrlKey && !event.shiftKey:
        event.preventDefault();
        event.target.blur();
        break;
      case event.keyCode === 38 && !event.altKey && !event.ctrlKey && !event.shiftKey:
        event.preventDefault();
        this.props.onStepUp(event);
        break;
      case event.keyCode === 40 && !event.altKey && !event.ctrlKey && !event.shiftKey:
        event.preventDefault();
        this.props.onStepDown(event);
        break;
      default:
    }
  };

  inputOnBlur = (event) => {
    this.flushValue(event);
  };

  render () {
    const textFieldProps = Object.assign({}, this.props);
    delete textFieldProps.onStepDown;
    delete textFieldProps.onStepUp;

    return (
      <TextField
        {...textFieldProps}
        value={this.state.dirtyInputValue}
        onChange={this.inputOnChange}
        onKeyDown={this.inputOnKeyDown}
        onBlur={this.inputOnBlur}
      />
    );
  }
}

export default
class SliderWithInput extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    min: PropTypes.any.isRequired,
    max: PropTypes.any.isRequired,
    step: PropTypes.any,
    // If `step` is specified, `sliderStep` is ignored.
    sliderStep: PropTypes.number,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired,
    toSliderValue: PropTypes.func,
    // This function should not throw an error. Every point on the slider should be a valid input.
    fromSliderValue: PropTypes.func,
    toInputValue: PropTypes.func,
    // If this function throws an error, the input value will be reset.
    fromInputValue: PropTypes.func,
    sliderStyle: PropTypes.object,
    inputStyle: PropTypes.object,
  };

  static defaultProps = {
    step: 0,
    sliderStep: 1,
    toSliderValue: (v) => Number(v),
    fromSliderValue: (v) => v,
    toInputValue: (v) => String(v),
    fromInputValue: (v) => v,
    sliderStyle: {},
    inputStyle: {},
  };

  static defaultSliderStyle = {
    display: 'block',
    width: 'auto',
    marginTop: '5px',
    marginBottom: 0,
    marginLeft: '10px',
    marginRight: '10px',
  };

  get label () {
    return this.props.label;
  }

  get inputValue () {
    return this.props.toInputValue(this.props.value);
  }

  get sliderMin () {
    return this.props.toSliderValue(this.props.min);
  }

  get sliderMax () {
    return this.props.toSliderValue(this.props.max);
  }

  get sliderStep () {
    return this.props.step ? this.props.toSliderValue(this.props.step) : this.props.sliderStep;
  }

  get sliderValue () {
    return this.props.toSliderValue(this.props.value);
  }

  /**
   * @param {Event} event
   * @param {*} newValue
   * @returns {*|null}
   */
  triggerValueOnChange (event, newValue) {
    let finalValue = newValue;

    if (isNaN(finalValue)) {
      return null;
    }

    if (finalValue > this.props.max) {
      finalValue = this.props.max;
    }

    if (finalValue < this.props.min) {
      finalValue = this.props.min;
    }

    this.props.onChange(event, finalValue);

    return finalValue;
  }

  sliderOnChange = (newSliderValue) => {
    const newValue = this.props.fromSliderValue(newSliderValue);

    this.triggerValueOnChange(null, newValue);
  };

  inputOnChange = (event, newInputValue) => {
    let newValue = '';

    try {
      newValue = this.props.fromInputValue(newInputValue);
    } catch (error) {
      this._input.resetValue();
      return;
    }

    // Final value might be different from the new value after value clamping.
    const finalValue = this.triggerValueOnChange(event, newValue);

    if (finalValue !== null && this._input) {
      const finalInputValue = this.props.toInputValue(finalValue);
      this._input.resetValue(finalInputValue);
    }
  };

  inputOnStepDown = (event) => {
    const newSliderValue = this.sliderValue - this.sliderStep;
    const newValue = this.props.fromSliderValue(newSliderValue);

    this.triggerValueOnChange(event, newValue);
  };

  inputOnStepUp = (event) => {
    const newSliderValue = this.sliderValue + this.sliderStep;
    const newValue = this.props.fromSliderValue(newSliderValue);

    this.triggerValueOnChange(event, newValue);
  };

  render () {
    return (
      <div className="SliderWithInput">
        <label className="SliderWithInput__label">{this.label}</label>
        <label className="SliderWithInput__input">
          <LazyTextField
            ref={(ref) => this._input = ref}
            value={this.inputValue}
            onChange={this.inputOnChange}
            style={{
              width: '100px',
              height: '26px',
              ...this.props.inputStyle,
            }}
            inputStyle={{
              textAlign: 'right',
            }}
            underlineStyle={{
              bottom: '3px',
            }}
            onStepDown={this.inputOnStepDown}
            onStepUp={this.inputOnStepUp}
          />
        </label>
        <Slider
          className="SliderWithInput__slider"
          min={this.sliderMin}
          max={this.sliderMax}
          step={this.sliderStep}
          value={this.sliderValue}
          onChange={this.sliderOnChange}
          style={{
            ...SliderWithInput.defaultSliderStyle,
            ...this.props.sliderStyle,
          }}
        />
      </div>
    );
  }
}
