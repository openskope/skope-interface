import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'material-ui/Slider';
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

  resetValue () {
    this.setState({
      dirtyInputValue: this.props.value,
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
    step: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired,
    toSliderValue: PropTypes.func,
    fromSliderValue: PropTypes.func,
    toInputValue: PropTypes.func,
    fromInputValue: PropTypes.func,
    sliderStyle: PropTypes.object,
    inputStyle: PropTypes.object,
  };

  static defaultProps = {
    toSliderValue: (v) => Number(v),
    fromSliderValue: (v) => v,
    toInputValue: (v) => String(v),
    fromInputValue: (v) => v,
    sliderStyle: {},
    inputStyle: {},
  };

  static defaultSliderStyle = {
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
    return this.props.toSliderValue(this.props.step);
  }

  get sliderValue () {
    return this.props.toSliderValue(this.props.value);
  }

  triggerValueOnChange (event, newValue) {
    let finalValue = newValue;

    if (isNaN(finalValue)) {
      this._input.resetValue();
      return;
    }

    if (finalValue > this.props.max) {
      finalValue = this.props.max;
    }

    if (finalValue < this.props.min) {
      finalValue = this.props.min;
    }

    this.props.onChange(event, finalValue);
  }

  sliderOnChange = (event, newSliderValue) => {
    const newValue = this.props.fromSliderValue(newSliderValue);

    this.triggerValueOnChange(event, newValue);
  };

  inputOnChange = (event, newInputValue) => {
    const newValue = this.props.fromInputValue(newInputValue);

    this.triggerValueOnChange(event, newValue);
  };

  inputOnStepDown = (event) => {
    const newValue = this.props.value - this.props.step;

    this.triggerValueOnChange(event, newValue);
  };

  inputOnStepUp = (event) => {
    const newValue = this.props.value + this.props.step;

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
          sliderStyle={{
            ...SliderWithInput.defaultSliderStyle,
            ...this.props.sliderStyle,
          }}
        />
      </div>
    );
  }
}
