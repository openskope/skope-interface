import React from 'react';
import PropTypes from 'prop-types';
import {
  reduxForm,
  SubmissionError,
} from 'redux-form';
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
    // Name of the form. This can not be changed once set.
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

    this._ReduxForm = reduxForm({
      form: props.name,
      destroyOnUnmount: false,
      forceUnregisterOnUnmount: true,
      enableReinitialize: true,
      keepDirtyOnReinitialize: true,
      onSubmitSuccess: (next, dispatch) => next(dispatch),
      onSubmitFail: (errors, dispatch, submitError) => console.error(errors, submitError),
    })(({
      handleSubmit,
      onReset,
      children,
    }) => <form onSubmit={handleSubmit} onReset={onReset}>{children}</form>);

    // Stores the references to each rendered forms.
    this._stepFormRefs = {};

    this.state = {
      stepIndex: 0,
      // Stores validation results.
      validations: {},
    };
  }

  get stepCount () {
    return this.props.steps.length;
  }

  get steps () {
    return this.props.steps;
  }

  getStepByIndex = (stepIndex) => this.steps[stepIndex]

  getStepByName = (stepName) => this.steps.find((step) => step.name === stepName)

  getStepFormRef = (stepName) => this._stepFormRefs[stepName]

  setStepFormRef = (stepName, form) => this._stepFormRefs[stepName] = form

  setStepValidity = (stepName, isValid) => {
    this.setState({
      validations: {
        ...this.state.validations,
        [stepName]: isValid,
      },
    });
  }

  /**
   * Any field-level validations will happen before this function.
   * This function returns another function for handling the step form submission.
   * @param  {Object} step
   * @param  {Number} stepIndex
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
  })

  /**
   * This function returns another function for handling the step form retraction.
   * @param  {Object} step
   * @param  {Number} stepIndex
   * @return {Function}
   */
  getStepRetractionHandler = (step, stepIndex) =>
  () => this.goToStepByIndex(stepIndex - 1)

  isStepValid = (stepName) => Boolean(this.state.validations[stepName])

  isStepValidated = (stepName) => stepName in this.state.validations

  goToStepByIndex = (nextStepIndex) => {
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

  updateStepValidity = (stepName) => {
    let isValid = true;

    const step = this.getStepByName(stepName);
    const contentForm = this.getStepFormRef(stepName);

    if (isValid && contentForm) {
      isValid = !contentForm.invalid;

      if (isValid && step.validation) {
        const validationErrors = step.validation(contentForm.values);

        if (Object.keys(validationErrors).length > 0) {
          isValid = false;
        }
      }
    }

    this.setStepValidity(stepName, isValid);

    return isValid;
  }

  renderSteps = () => {
    const {
      steps: formSteps,
      defaultValues: formDefaultValues,
    } = this.props;

    return formSteps.map((step, stepIndex) => (
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
          <this._ReduxForm
            initialValues={formDefaultValues}
            onReset={this.getStepRetractionHandler(step, stepIndex)}
            onSubmit={this.getStepSubmissionHandler(step, stepIndex)}
            ref={(ref) => this.setStepFormRef(step.name, ref)}
          >
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
          </this._ReduxForm>
        </StepContent>
      </Step>
    ));
  }

  render () {
    const {
      stepIndex,
    } = this.state;

    return (
      <Stepper
        activeStep={stepIndex}
        linear={false}
        orientation="vertical"
      >
        {this.renderSteps()}

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
    );
  }
}
