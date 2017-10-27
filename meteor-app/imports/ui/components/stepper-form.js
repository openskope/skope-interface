import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import {
  Step,
  Stepper,
  StepButton,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
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
    steps: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(PropTypes.object),
      validation: PropTypes.func,
      // Used to block transition when validation fails.
      validationBlocksAdvancing: PropTypes.bool,
      // Used to block transition when validation fails.
      validationBlocksRetreating: PropTypes.bool,
    })).isRequired,
    //!
  };

  static stepCardStyles = {
    marginTop: 20,
    width: 500,
    // Some gap to let the shadow be visible.
    marginBottom: 20,
  };

  static packageStep = (step, index) => ({
    ...step,
    index,
    //!
  });

  constructor (props) {
    super(props);

    this.state = {
      stepIndex: 0,
      finished: false,
      // Array of packaged steps.
      steps: props.steps.map(this.constructor.packageStep),
      // Stores validation results.
      validations: {},
    };

    // Map of steps by name.
    this.state.stepsMap = this.state.steps.reduce((acc, step) => ({
      ...acc,
      [step.name]: step,
    }), {});
  }

  get stepCount () {
    return this.state.steps.length;
  }

  getStepByIndex = (stepIndex) => this.state.steps[stepIndex];

  getStepByName = (stepName) => this.state.stepsMap[stepName];

  isStepValidated = (stepName) => stepName in this.state.validations;

  isStepValid = (stepName) => Boolean(this.state.validations[stepName]);

  validateStep (stepName) {
    //!
    let isValid = false;

    const step = this.getStepByName(stepName);

    if (step.validation) {
      //! Collect all fields.
      const fields = {};
      const allFields = {};

      isValid = step.validation(fields, allFields);
    } else {
      isValid = true;
    }

    this.setState({
      validations: {
        ...this.state.validations,
        [stepName]: isValid,
      },
    });

    return isValid;
  }

  goToStepByIndex (nextStepIndex) {
    const currSectionIndex = this.state.stepIndex;
    const isReviewStep = currSectionIndex === this.stepCount;

    if (!isReviewStep) {
      const currStep = this.getStepByIndex(currSectionIndex);
      const stepIsValid = this.validateStep(currStep.name);

      if (currStep.validationBlocksAdvancing && (nextStepIndex > currSectionIndex)) {
        return;
      }
      if (currStep.validationBlocksRetreating && (nextStepIndex < currSectionIndex)) {
        return;
      }
    }

    this.setState({
      stepIndex: nextStepIndex,
    });
  }

  renderStepActions = (stepIndex, stepCount) =>
  <div
    style={{
      margin: '12px 0',
    }}
  >
    <RaisedButton
      label={stepIndex >= stepCount ? 'Finish' : 'Next'}
      disableTouchRipple={true}
      disableFocusRipple={true}
      primary={true}
      onClick={() => this.goToStepByIndex(stepIndex + 1)}
    />
    {stepIndex > 0 && (
      <FlatButton
        label="Back"
        disabled={stepIndex === 0}
        disableTouchRipple={true}
        disableFocusRipple={true}
        onClick={() => this.goToStepByIndex(stepIndex - 1)}
        style={{
          marginLeft: 12,
        }}
      />
    )}
  </div>;

  renderStep = (step, stepIndex, steps) =>
  <Step key={`form-section-${stepIndex}`}>
    <StepButton
      icon={
        !this.isStepValidated(step.name)
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
      <Card
        style={this.constructor.stepCardStyles}
      >
        <CardText>{step.content}</CardText>
        <CardActions>{this.renderStepActions(stepIndex, steps.length)}</CardActions>
      </Card>
    </StepContent>
  </Step>;

  render () {
    const {
      stepIndex,
      steps,
    } = this.state;

    return (
      <MuiThemeProvider muiTheme={customTheme}>
        <Stepper
          activeStep={stepIndex}
          linear={false}
          orientation="vertical"
        >
          {steps.map(this.renderStep)}

          <Step key={`step-review`}>
            <StepButton>Review</StepButton>
            <StepContent>
              <Card
                style={this.constructor.stepCardStyles}
              >
                <CardText>
                  <p>
                    Show validation results of each step here.
                  </p>
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