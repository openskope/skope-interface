// This file exports 2 components.
/* eslint react/no-multi-comp: off */

import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';
import Slider from 'rc-slider/lib/Slider';
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';
import TextField from 'material-ui/TextField';

import {
  NOOP,
} from '/imports/helpers/model';

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
    onStepDown: NOOP,
    onStepUp: NOOP,
  };

  constructor (props) {
    super(props);

    this.state = {
      transitionaryInputValue: props.value,
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.state.transitionaryInputValue) {
      this.setState({
        transitionaryInputValue: nextProps.value,
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
      transitionaryInputValue: newValue,
    });
  }

  flushValue (event) {
    this.props.onChange(event, this.state.transitionaryInputValue);
  }

  inputOnChange = (event, newValue) => {
    this.setState({
      transitionaryInputValue: newValue,
    });
  };

  inputOnKeyDown = (event) => {
    switch (true) {
      case event.keyCode === 13 && !event.altKey && !event.ctrlKey && !event.shiftKey:
        event.preventDefault();
        event.target.blur();
        break;
      case event.keyCode === 38 && !event.altKey && !event.ctrlKey && !event.shiftKey:
        // Allow the user to prevent default.
        this.props.onStepUp(event);
        break;
      case event.keyCode === 40 && !event.altKey && !event.ctrlKey && !event.shiftKey:
        // Allow the user to prevent default.
        this.props.onStepDown(event);
        break;
      default:
    }
  };

  inputOnBlur = (event) => {
    this.flushValue(event);
  };

  render () {
    const {
      transitionaryInputValue: inputValue,
    } = this.state;
    const textFieldProps = Object.assign({}, this.props);
    delete textFieldProps.onStepDown;
    delete textFieldProps.onStepUp;

    return (
      <TextField
        name={`LazyTextField-${uuid()}`}
        {...textFieldProps}
        value={inputValue}
        onChange={this.inputOnChange}
        onKeyDown={this.inputOnKeyDown}
        onBlur={this.inputOnBlur}
      />
    );
  }
}

export
/**
 * This component displays a numeric value on a slider, as well as in a text
 * input field.
 */
class SliderWithInput extends React.PureComponent {
  static propTypes = {
    // Use `label` to specify the text label displayed for this control.
    label: PropTypes.string.isRequired,
    // Specify the value of the control.
    value: PropTypes.any.isRequired,
    /**
     * Specify the minimum possible value.
     * Has the same unit as `value`.
     */
    min: PropTypes.any.isRequired,
    /**
     * Specify the maximum possible value.
     * Has the same unit as `value`.
     */
    max: PropTypes.any.isRequired,
    /**
     * Specify how much of the value to change when stepping.
     * Has the same unit as `value`.
     * Has a default value of `0` indicating a step is not specified.
     */
    step: PropTypes.any,
    /**
     * Specify the step size of the slider.
     * It should be used when stepping relies on the slider instead of the value.
     * If `step` is specified, this is ignored.
     */
    sliderStep: PropTypes.number,
    /**
     * Callback when the slider value is changed.
     * This is triggered multiple times during a drag.
     */
    onChange: PropTypes.func.isRequired,
    /**
     * Callback when the slider value is settled.
     * This is triggered only at the end of a drag.
     */
    onFinish: PropTypes.func,

    /**
     * Transform function to convert `value` into the number used by the slider.
     * This is useful to avoid keeping a transient value in the code.
     * The input of the function is the `value` and alike (`min`, `max`, `step`, etc.).
     * The return value of the function should be a numeric value.
     */
    toSliderValue: PropTypes.func,
    /**
     * Transform function that does the reverse of `toSliderValue`.
     * This function should not throw an error. Every point on the slider should be a valid input.
     */
    fromSliderValue: PropTypes.func,

    /**
     * Transform function to convert `value` into the string used by the text input.
     * This is useful to avoid keeping a transient value in the code.
     * The input of the function is the `value` and alike (`min`, `max`, `step`, etc.).
     * The return value of the function should be a string.
     */
    toInputValue: PropTypes.func,
    /**
     * Transform function that does the reverse of `toInputValue`.
     * If this function throws an error, the input value will be reset.
     */
    fromInputValue: PropTypes.func,

    sliderStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    sliderProps: PropTypes.object,
    inputProps: PropTypes.object,
    style: PropTypes.object,
  };

  static defaultProps = {
    step: 0,
    sliderStep: 1,
    onFinish: NOOP,
    toSliderValue: (v) => Number(v),
    fromSliderValue: (v) => v,
    toInputValue: (v) => String(v),
    fromInputValue: (v) => v,
    sliderStyle: {},
    inputStyle: {},
    sliderProps: {},
    inputProps: {},
    style: {},
  };

  static defaultStyle = {
    paddingTop: '0.5em',
    paddingLeft: '1em',
    paddingRight: '1em',
    paddingBottom: '1.5em',
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
    whiteSpace: 'nowrap',
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
   * @param {boolean} ending - Interaction is ending (e.g. mouseup on slider)
   * @returns {*|null}
   */
  triggerValueOnChange (event, newValue, ending) {
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

    if (ending && this.props.onFinish) {
      this.props.onFinish(event, finalValue);
    }

    return finalValue;
  }

  /**
   * @param {number} newSliderValue
   */
  sliderOnChange = (newSliderValue) => {
    const newValue = this.props.fromSliderValue(newSliderValue);

    this.triggerValueOnChange(null, newValue);
  };
  /**
   * @param {number} newSliderValue
   */
  sliderOnFinish = (newSliderValue) => {
    const newValue = this.props.fromSliderValue(newSliderValue);

    this.triggerValueOnChange(null, newValue, true);
  };

  inputOnChange = (event, newInputValue) => {
    const inputComponent = this.getInputComponent();
    let newValue = '';

    try {
      newValue = this.props.fromInputValue(newInputValue);
    } catch (error) {
      console.warn('SliderWithInput.inputOnChange', error);

      inputComponent.resetValue();
      return;
    }

    // Final value might be different from the new value after value clamping.
    const finalValue = this.triggerValueOnChange(event, newValue, true);

    if (finalValue !== null && inputComponent) {
      const finalInputValue = this.props.toInputValue(finalValue);
      inputComponent.resetValue(finalInputValue);
    }
  };

  inputOnStepDown = (event) => {
    // Number input has built-in stepping shortcuts.
    if (this.props.inputProps.type === 'number') {
      return;
    }

    const newSliderValue = this.sliderValue - this.sliderStep;
    const newValue = this.props.fromSliderValue(newSliderValue);

    console.log('SliderWithInput.inputOnStepDown', {
      sliderValue: this.sliderValue,
      sliderStep: this.sliderStep,
      newSliderValue,
      newValue,
    });

    this.triggerValueOnChange(event, newValue, true);
  };

  inputOnStepUp = (event) => {
    // Number input has built-in stepping shortcuts.
    if (this.props.inputProps.type === 'number') {
      return;
    }

    const newSliderValue = this.sliderValue + this.sliderStep;
    const newValue = this.props.fromSliderValue(newSliderValue);

    console.log('SliderWithInput.inputOnStepUp', {
      sliderValue: this.sliderValue,
      sliderStep: this.sliderStep,
      newSliderValue,
      newValue,
    });

    this.triggerValueOnChange(event, newValue, true);
  };

  render () {
    return (
      <div
        className="SliderWithInput"
        style={{
          ...this.constructor.defaultStyle,
          ...this.props.style,
        }}
      >
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
          onAfterChange={this.sliderOnFinish}
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
    /**
     * Note that `value` is now an array.
     * It should consist of `[start, end]` of the range.
     */
    value: PropTypes.arrayOf(PropTypes.any).isRequired,
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
   * @param {boolean} ending - Interaction is ending (e.g. mouseup on slider)
   * @returns {Array<*>|null}
   */
  triggerValueOnChange (event, newValues, ending) {
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

    if (ending && this.props.onFinish) {
      this.props.onFinish(event, finalValues);
    }

    return finalValues;
  }

  /**
   * @param {Array<number>} newSliderValue
   */
  sliderOnChange = (newSliderValue) => {
    // @type {Array<*>}
    const newValues = newSliderValue.map((sliderValue) => this.props.fromSliderValue(sliderValue));

    this.triggerValueOnChange(null, newValues);
  };
  /**
   * @param {Array<number>} newSliderValue
   */
  sliderOnFinish = (newSliderValue) => {
    // @type {Array<*>}
    const newValues = newSliderValue.map((sliderValue) => this.props.fromSliderValue(sliderValue));

    this.triggerValueOnChange(null, newValues, true);
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
      console.warn('RangeWithInput.inputOnChange', error);

      inputComponent.resetValue();
      return;
    }

    const newValues = this.props.value.map((v, i) => ((i === valueIndex) ? newValue : v));

    // Final value might be different from the new value after value clamping.
    // @type {Array<*>|null}
    const finalValues = this.triggerValueOnChange(event, newValues, true);

    if (finalValues !== null && inputComponent) {
      const finalValue = finalValues[valueIndex];
      const finalInputValue = this.props.toInputValue(finalValue);
      inputComponent.resetValue(finalInputValue);
    }
  };

  /**
   * @param {number} valueIndex
   * @param {number} amount
   */
  stepBy = (valueIndex, amount) => {
    const sliderValue = this.sliderValue[valueIndex];
    const newSliderValue = sliderValue + (this.sliderStep * amount);
    const newValue = this.props.fromSliderValue(newSliderValue);
    const newValues = this.props.value.map((v, i) => ((i === valueIndex) ? newValue : v));

    this.triggerValueOnChange(null, newValues, true);
  };

  /**
   * @param {Event} event
   * @param {number} valueIndex
   */
  inputOnStepDown = (event, valueIndex) => {
    // Number input has built-in stepping shortcuts.
    if (this.props.inputProps.type === 'number') {
      return;
    }

    event.preventDefault();

    this.stepBy(valueIndex, -1);
  };

  /**
   * @param {Event} event
   * @param {number} valueIndex
   */
  inputOnStepUp = (event, valueIndex) => {
    // Number input has built-in stepping shortcuts.
    if (this.props.inputProps.type === 'number') {
      return;
    }

    event.preventDefault();

    this.stepBy(valueIndex, 1);
  };

  render () {
    const inputValues = this.inputValue;

    return (
      <div
        className="RangeWithInput"
        style={{
          ...this.constructor.defaultStyle,
          ...this.props.style,
        }}
      >
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
          onAfterChange={this.sliderOnFinish}
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
