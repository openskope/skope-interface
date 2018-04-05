import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import Slider from 'rc-slider/lib/Slider';
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';
import TextField from 'material-ui/TextField';

const SliderWithHandle = Slider.createSliderWithTooltip(Slider);
const RangeWithHandle = Slider.createSliderWithTooltip(Range);

class LazyTextField extends React.Component {
  static propTypes = {
    ...TextField.propTypes,
    disabled: PropTypes.bool,
    onStepDown: PropTypes.func,
    onStepUp: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
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
        name={`LazyTextField-${uuidv4()}`}
        {...textFieldProps}
        value={this.state.dirtyInputValue}
        onChange={this.inputOnChange}
        onKeyDown={this.inputOnKeyDown}
        onBlur={this.inputOnBlur}
      />
    );
  }
}

export
class SliderWithInput extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    // `min`, `max`, `step` and `value` have the same unit.
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
    sliderProps: PropTypes.object,
    inputProps: PropTypes.object,
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
    sliderProps: {},
    inputProps: {},
  };

  static defaultSliderStyle = {
    display: 'block',
    width: 'auto',
    marginTop: '5px',
    marginBottom: 0,
    marginLeft: '10px',
    marginRight: '10px',
  };

  static defaultMarkStyle = {
    width: false,
    marginLeft: false,
    transform: 'translateX(-50%)',
  };

  constructor (props) {
    super(props);

    /**
     * This stores the reference to the input field.
     * @type {React.Element}
     */
    this._input = null;
  }

  /**
   * @type {string}
   */
  get label () {
    return this.props.label;
  }

  /**
   * @type {string}
   */
  get inputValue () {
    return this.props.toInputValue(this.props.value);
  }

  /**
   * @type {number}
   */
  get sliderMin () {
    return this.props.toSliderValue(this.props.min);
  }

  /**
   * @type {number}
   */
  get sliderMax () {
    return this.props.toSliderValue(this.props.max);
  }

  /**
   * @type {string}
   */
  get sliderMinLabel () {
    return this.props.toInputValue(this.props.min);
  }

  /**
   * @type {string}
   */
  get sliderMaxLabel () {
    return this.props.toInputValue(this.props.max);
  }

  /**
   * @type {number}
   */
  get sliderStep () {
    return this.props.step ? this.props.toSliderValue(this.props.step) : this.props.sliderStep;
  }

  /**
   * @type {number}
   */
  get sliderValue () {
    return this.props.toSliderValue(this.props.value);
  }

  get sliderMarks () {
    return {
      [this.sliderMin]: {
        style: {
          ...this.constructor.defaultMarkStyle,
        },
        label: this.sliderMinLabel,
      },
      [this.sliderMax]: {
        style: {
          ...this.constructor.defaultMarkStyle,
        },
        label: this.sliderMaxLabel,
      },
    };
  }

  /**
   * @return {React.Element}
   */
  getInputComponent () {
    return this._input;
  }
  /**
   * @param {React.Element} element
   */
  setInputComponent (element) {
    this._input = element;
  }

  /**
   * @param {number} sliderValue
   * @return {string}
   */
  tipFormatter = (sliderValue) => {
    const newValue = this.props.fromSliderValue(sliderValue);

    return this.props.toInputValue(newValue);
  };

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
    const inputComponent = this.getInputComponent();
    let newValue = '';

    try {
      newValue = this.props.fromInputValue(newInputValue);
    } catch (error) {
      inputComponent.resetValue();
      return;
    }

    // Final value might be different from the new value after value clamping.
    const finalValue = this.triggerValueOnChange(event, newValue);

    if (finalValue !== null && inputComponent) {
      const finalInputValue = this.props.toInputValue(finalValue);
      inputComponent.resetValue(finalInputValue);
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
            {...this.props.inputProps}

            ref={(ref) => this.setInputComponent(ref)}
            value={this.inputValue}
            disabled={this.props.disabled}
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
        <SliderWithHandle
          {...this.props.sliderProps}

          className="SliderWithInput__slider"
          min={this.sliderMin}
          max={this.sliderMax}
          step={this.sliderStep}
          value={this.sliderValue}
          disabled={this.props.disabled}
          marks={this.sliderMarks}
          onChange={this.sliderOnChange}
          tipFormatter={this.tipFormatter}
          tipProps={{
            placement: 'bottom',
          }}
          style={{
            ...SliderWithInput.defaultSliderStyle,
            ...this.props.sliderStyle,
          }}
        />
      </div>
    );
  }
}

export
class RangeWithInput extends SliderWithInput {
  static propTypes = {
    ...SliderWithInput.propTypes,
    // Note that `value` is now an array.
  };

  static defaultProps = {
    ...SliderWithInput.defaultProps,
  };

  constructor (props) {
    super(props);

    /**
     * This stores the references to the input fields.
     * @type {Array<React.Element>}
     */
    this._input = [];
  }

  /**
   * @type {Array<string>}
   */
  get inputValue () {
    return this.props.value.map((value) => this.props.toInputValue(value));
  }

  /**
   * @type {Array<number>}
   */
  get sliderValue () {
    return this.props.value.map((value) => this.props.toSliderValue(value));
  }

  /**
   * @param {number} index
   * @return {React.Element}
   */
  getInputComponent (index) {
    return this._input[index];
  }
  /**
   * @param {React.Element} element
   * @param {number} index
   */
  setInputComponent (element, index) {
    this._input[index] = element;
  }

  /**
   * @param {Event} event
   * @param {Array<*>} newValues
   * @returns {Array<*>|null}
   */
  triggerValueOnChange (event, newValues) {
    const finalValues = newValues.map((value) => {
      let finalValue = value;

      if (isNaN(finalValue)) {
        return null;
      }

      if (finalValue > this.props.max) {
        finalValue = this.props.max;
      }

      if (finalValue < this.props.min) {
        finalValue = this.props.min;
      }

      return finalValue;
    });

    //! Should null values also be returned?
    if (finalValues.some((value) => value === null)) {
      return null;
    }

    this.props.onChange(event, finalValues);

    return finalValues;
  }

  /**
   * @param {Array<*>} newSliderValue
   */
  sliderOnChange = (newSliderValue) => {
    // @type {Array<*>}
    const newValues = newSliderValue.map((sliderValue) => this.props.fromSliderValue(sliderValue));

    this.triggerValueOnChange(null, newValues);
  };

  /**
   * @param {Event} event
   * @param {string} newInputValue
   * @param {number} valueIndex
   */
  inputOnChange = (event, newInputValue, valueIndex) => {
    const inputComponent = this.getInputComponent(valueIndex);
    let newValue = '';

    try {
      newValue = this.props.fromInputValue(newInputValue);
    } catch (error) {
      inputComponent.resetValue();
      return;
    }

    const newValues = this.props.value.map((v, i) => ((i === valueIndex) ? newValue : v));

    // Final value might be different from the new value after value clamping.
    // @type {Array<*>|null}
    const finalValues = this.triggerValueOnChange(event, newValues);

    if (finalValues !== null && inputComponent) {
      const finalValue = finalValues[valueIndex];
      const finalInputValue = this.props.toInputValue(finalValue);
      inputComponent.resetValue(finalInputValue);
    }
  };

  /**
   * @param {Event} event
   * @param {number} valueIndex
   */
  inputOnStepDown = (event, valueIndex) => {
    const sliderValue = this.sliderValue[valueIndex];
    const newSliderValue = sliderValue - this.sliderStep;
    const newValue = this.props.fromSliderValue(newSliderValue);
    const newValues = this.props.value.map((v, i) => ((i === valueIndex) ? newValue : v));

    this.triggerValueOnChange(event, newValues);
  };

  /**
   * @param {Event} event
   * @param {number} valueIndex
   */
  inputOnStepUp = (event, valueIndex) => {
    const sliderValue = this.sliderValue[valueIndex];
    const newSliderValue = sliderValue + this.sliderStep;
    const newValue = this.props.fromSliderValue(newSliderValue);
    const newValues = this.props.value.map((v, i) => ((i === valueIndex) ? newValue : v));

    this.triggerValueOnChange(event, newValues);
  };

  render () {
    const inputValues = this.inputValue;

    return (
      <div className="RangeWithInput">
        <label className="RangeWithInput__label">{this.label}</label>
        <label className="RangeWithInput__input">
          <LazyTextField
            {...this.props.inputProps}

            ref={(ref) => this.setInputComponent(ref, 0)}
            value={inputValues[0]}
            disabled={this.props.disabled}
            onChange={(e, v) => this.inputOnChange(e, v, 0)}
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
            onStepDown={(e) => this.inputOnStepDown(e, 0)}
            onStepUp={(e) => this.inputOnStepUp(e, 0)}
          />
          <span> - </span>
          <LazyTextField
            {...this.props.inputProps}

            ref={(ref) => this.setInputComponent(ref, 1)}
            value={inputValues[1]}
            disabled={this.props.disabled}
            onChange={(e, v) => this.inputOnChange(e, v, 1)}
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
            onStepDown={(e) => this.inputOnStepDown(e, 1)}
            onStepUp={(e) => this.inputOnStepUp(e, 1)}
          />
        </label>
        <RangeWithHandle
          {...this.props.sliderProps}

          className="RangeWithInput__slider"
          min={this.sliderMin}
          max={this.sliderMax}
          step={this.sliderStep}
          value={this.sliderValue}
          disabled={this.props.disabled}
          marks={this.sliderMarks}
          onChange={this.sliderOnChange}
          tipFormatter={this.tipFormatter}
          tipProps={{
            placement: 'bottom',
          }}
          style={{
            ...RangeWithInput.defaultSliderStyle,
            ...this.props.sliderStyle,
          }}
        />
      </div>
    );
  }
}
