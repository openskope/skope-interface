import React from 'react';
import PropTypes from 'prop-types';
import {
  reduxForm,
  SubmissionError,
} from 'redux-form';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import {
  Step,
  Stepper,
  StepButton,
  StepContent,
} from 'material-ui/Stepper';
import {
  Card,
  CardActions,
  CardText,
} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import CheckIcon from 'material-ui/svg-icons/navigation/check';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {
  red500,
  green500,
} from 'material-ui/styles/colors';

export default class StepperForm extends React.Component {
  static propTypes = {
    // Name of the form.
    name: PropTypes.string.isRequired,
    defaultValues: PropTypes.object,
    // Steps.
    steps: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(PropTypes.object),
      content: PropTypes.any,
      validation: PropTypes.func,
      // Used to block transition when validation fails.
      validationBlocksRetreating: PropTypes.bool,
    })).isRequired,
  };

  static stepCardStyles = {
    marginTop: 20,
    width: 500,
    // Some gap to let the shadow be visible.
    marginBottom: 20,
  };

  constructor (props) {
    super(props);

    this._createReduxForm = reduxForm({
      form: props.name,
      destroyOnUnmount: false,
      forceUnregisterOnUnmount: true,
      enableReinitialize: true,
      keepDirtyOnReinitialize: true,
      onSubmitSuccess: (next, dispatch) => next(dispatch),
      onSubmitFail: (errors, dispatch, submitError) => console.error(errors, submitError),
      // validate
    });

    this._packageStep = (step, stepIndex) => ({
      ...step,
      index: stepIndex,
      ContentForm: this._createReduxForm(({
        handleSubmit,

        onReset,
      }) => (
        <form onSubmit={handleSubmit} onReset={onReset}>
          <Card
            style={this.constructor.stepCardStyles}
          >
            <CardText>{step.content}</CardText>
            <CardActions>
              <div
                style={{
                  margin: '12px 0',
                }}
              >
                <RaisedButton
                  type="submit"
                  label={stepIndex >= this.stepCount ? 'Finish' : 'Next'}
                  disableTouchRipple
                  disableFocusRipple
                  primary
                />
                {stepIndex > 0 && (
                  <FlatButton
                    type="reset"
                    label="Back"
                    disabled={stepIndex === 0}
                    disableTouchRipple
                    disableFocusRipple
                    style={{
                      marginLeft: 12,
                    }}
                  />
                )}
              </div>
            </CardActions>
          </Card>
        </form>
      )),
      // Stores the reference to the form.
      contentForm: null,
    });

    // Array of packaged steps.
    this._steps = props.steps.map(this._packageStep);

    // Map of steps by name.
    this._stepsMap = this._steps.reduce((acc, step) => ({
      ...acc,
      [step.name]: step,
    }), {});

    this.state = {
      stepIndex: 0,
      finished: false,
      // Stores validation results.
      validations: {},
    };
  }

  get stepCount () {
    return this._steps.length;
  }

  getStepByIndex = (stepIndex) => this._steps[stepIndex];

  getStepByName = (stepName) => this._stepsMap[stepName];

  setStepValid = (stepName, isValid) => {
    this.setState({
      validations: {
        ...this.state.validations,
        [stepName]: isValid,
      },
    });
  };

  /**
   * Any field-level validations will happen before this function.
   * This function returns another function for handling the step form submission.
   * @param  {Object} step
   * @param  {Number} stepIndex
   * @param  {Array.<Object>} steps
   * @return {Function}
   */
  getStepSubmissionHandler = (step, stepIndex) =>
  (values) => new Promise((resolve) => {
    if (step.validation) {
      const validationErrors = step.validation(values);

      if (Object.keys(validationErrors).length > 0) {
        throw new SubmissionError(validationErrors);
      }
    }

    resolve(() => this.goToStepByIndex(stepIndex + 1));
  });

  /**
   * This function returns another function for handling the step form retraction.
   * @param  {Object} step
   * @param  {Number} stepIndex
   * @param  {Array.<Object>} steps
   * @return {Function}
   */
  getStepRetractionHandler = (step, stepIndex) =>
  () => this.goToStepByIndex(stepIndex - 1);

  goToStepByIndex (nextStepIndex) {
    const currSectionIndex = this.state.stepIndex;
    const isReviewStep = currSectionIndex === this.stepCount;

    if (!isReviewStep) {
      const currStep = this.getStepByIndex(currSectionIndex);
      const stepIsValid = this.updateStepValidity(currStep.name);

      if (!stepIsValid && currStep.validationBlocksRetreating && (nextStepIndex < currSectionIndex)) {
        return;
      }
    }

    this.setState({
      stepIndex: nextStepIndex,
    });
  }

  updateStepValidity (stepName) {
    const step = this.getStepByName(stepName);
    const contentForm = step.contentForm;
    let isValid = !contentForm.invalid;

    if (isValid && step.validation) {
      const validationErrors = step.validation(contentForm.values);

      if (Object.keys(validationErrors).length > 0) {
        isValid = false;
      }
    }

    this.setStepValid(stepName, isValid);

    return isValid;
  }

  isStepValid = (stepName) => Boolean(this.state.validations[stepName]);

  isStepValidated = (stepName) => stepName in this.state.validations;

  renderStep = (step, stepIndex, steps) => (
    <Step key={`form-section-${stepIndex}`}>
      <StepButton
        icon={
          this.state.stepIndex === stepIndex || !this.isStepValidated(step.name)
          ? (stepIndex + 1)
          : (
            this.isStepValid(step.name)
            ? <CheckIcon color={green500} />
            : <WarningIcon color={red500} />
          )
        }
        onClick={() => this.goToStepByIndex(stepIndex)}
      >{step.title}</StepButton>
      <StepContent>
        <step.ContentForm
          ref={(ref) => step.contentForm = ref}
          onReset={this.getStepRetractionHandler(step, stepIndex, steps)}
          onSubmit={this.getStepSubmissionHandler(step, stepIndex, steps)}
          initialValues={this.props.defaultValues}
        />
      </StepContent>
    </Step>
  );

  render () {
    const {
      stepIndex,
    } = this.state;

    return (
      <MuiThemeProvider muiTheme={customTheme}>
        <Stepper
          activeStep={stepIndex}
          linear={false}
          orientation="vertical"
        >
          {this._steps.map(this.renderStep)}

          <Step key={'step-review'}>
            <StepButton>Review</StepButton>
            <StepContent>
              <Card
                style={this.constructor.stepCardStyles}
              >
                <CardText>
                  <p>
                    Show validation results of each step here.
                  </p>
                  <RaisedButton
                    label="Submit"
                    disableTouchRipple
                    disableFocusRipple
                    primary
                  />
                </CardText>
                <CardActions>Actions</CardActions>
              </Card>
            </StepContent>
          </Step>
        </Stepper>
      </MuiThemeProvider>
    );
  }
}
