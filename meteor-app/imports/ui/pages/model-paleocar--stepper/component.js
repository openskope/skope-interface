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
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {red500} from 'material-ui/styles/colors';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import StepperForm from '/imports/ui/components/stepper-form';

export default class ModelPage extends React.Component {

  static propTypes = {
    // Indicate if a point is selected for inspection.
    inspectPointSelected: PropTypes.bool.isRequired,
    // The coordinate of the point being inspected.
    inspectPointCoordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
    // Callback function for selecting a point to inspect.
    selectInspectPoint: PropTypes.func.isRequired,

    // Callback function for the map modal.
    toggleMap: PropTypes.func.isRequired,

    // Callback function for the form.
    updateForm: PropTypes.func.isRequired,

    // Values in the form.
    predictionYears: PropTypes.number.isRequired,
    meanVar: PropTypes.string.isRequired,
    minWidth: PropTypes.number.isRequired,

  };

  constructor (props) {
    super(props);

    this.state = {
      stepIndex: 0,
      finished: false,
    };

    this._bound_mapOnClick = this._mapOnClick.bind(this);
    this._bound_toggleMap = this._toggleMap.bind(this);
    this._bound_updateLatitude = this._updateLatitude.bind(this);
    this._bound_updateLongitude = this._updateLongitude.bind(this);
    this._bound_updatePredictionYears = this._updatePredictionYears.bind(this);
    this._bound_updateMeanVar = this._updateMeanVar.bind(this);
    this._bound_updateMinWidth = this._updateMinWidth.bind(this);
  }

  componentDidMount () {
    if (this._mapview) {
      this._mapview.addEventListener('click:view', this._bound_mapOnClick);
    }
  }

  _mapOnClick (event) {
    const {
      selectInspectPoint,
    } = this.props;

    selectInspectPoint(event.latLongCoordinate);
  }

  _toggleMap(/* event */) {
    const {
      toggleMap,
    } = this.props;

    toggleMap();
  }

  _updateLatitude(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      predictionYears,
      meanVar,
      minWidth,
    } = this.props;

    updateForm({
      latitude: parseFloat(target.value),
      longitude: inspectPointCoordinate[0],
      predictionYears,
      meanVar,
      minWidth,
    });
  }

  _updateLongitude(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      predictionYears,
      meanVar,
      minWidth,
    } = this.props;

    updateForm({
      latitude: inspectPointCoordinate[1],
      longitude: parseFloat(target.value),
      predictionYears,
      meanVar,
      minWidth,
    });
  }

  _updatePredictionYears(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      meanVar,
      minWidth,
    } = this.props;

    updateForm({
      latitude: inspectPointCoordinate[1],
      longitude: inspectPointCoordinate[0],
      predictionYears: parseInt(target.value, 10),
      meanVar,
      minWidth,
    });
  }

  _updateMeanVar(event, index, value) {
    const {
      updateForm,
      inspectPointCoordinate,
      predictionYears,
      minWidth,
    } = this.props;

    updateForm({
      latitude: inspectPointCoordinate[1],
      longitude: inspectPointCoordinate[0],
      predictionYears,
      meanVar: value,
      minWidth,
    });
  }

  _updateMinWidth(event) {
    const target = event.currentTarget;
    const {
      updateForm,
      inspectPointCoordinate,
      predictionYears,
      meanVar,
    } = this.props;

    updateForm({
      latitude: inspectPointCoordinate[1],
      longitude: inspectPointCoordinate[0],
      predictionYears,
      meanVar,
      minWidth: parseInt(target.value, 10),
    });
  }

  handleNext = () => {
    const {stepIndex} = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });
  };

  handlePrev = () => {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  };

  renderStepActions = (step) => {
    const {
      stepIndex,
    } = this.state;

    return (
      <div style={{margin: '12px 0'}}>
        <RaisedButton
          label={stepIndex >= 3 ? 'Finish' : 'Next'}
          disableTouchRipple={true}
          disableFocusRipple={true}
          primary={true}
          onClick={this.handleNext}
          style={{marginRight: 12}}
        />
        {step > 0 && (
          <FlatButton
            label="Back"
            disabled={stepIndex === 0}
            disableTouchRipple={true}
            disableFocusRipple={true}
            onClick={this.handlePrev}
          />
        )}
      </div>
    );
  };

  stepCardStyles = {
    marginTop: 20,
    width: 500,
    // Some gap to let the shadow be visible.
    marginBottom: 20,
  };

  render () {
    const {
      inspectPointSelected,
      inspectPointCoordinate,

      predictionYears,
      meanVar,
      minWidth,
    } = this.props;

    const {
      stepIndex,
    } = this.state;

    return (
      <MuiThemeProvider muiTheme={customTheme}>
        <div className="page-paleocar">
          <StepperForm
            steps={[
              {
                name: 'primary',
                title: 'Primary',
                fields: [
                  {
                    type: 'text',
                    label: 'Title',
                    name: 'title',
                  },
                  {
                    type: 'text',
                    label: 'Description',
                    multiLine: true,
                    rows: 2,
                    rowsMax: 4,
                  },
                ],
                validation: (fields, allFields) => {
                  return false;
                },
                content: (
                  <div className="form-fields">
                    <TextField
                      className="form-fields__item"
                      floatingLabelText="Title"
                    />
                    <TextField
                      className="form-fields__item"
                      floatingLabelText="Description"
                      multiLine={true}
                      rows={2}
                      rowsMax={4}
                    />
                    <p>Derived From</p>
                  </div>
                ),
              },
              {
                name: 'boundary',
                title: 'Boundary',
                content: (
                  <p>An ad group contains one or more ads which target a shared set of keywords.</p>
                ),
              },
              {
                name: 'inputs',
                title: 'Inputs',
                content: (
                  <div className="form-fields">
                    <TextField
                      className="form-fields__item"
                      floatingLabelText="Prediction Years"
                    />
                    <TextField
                      className="form-fields__item"
                      floatingLabelText="Minimum Width"
                    />
                    <SelectField
                      floatingLabelText="Mean Variance"
                      value={meanVar}
                      onChange={this._bound_updateMeanVar}
                    >
                      <MenuItem value="none" primaryText="None" />
                      <MenuItem value="calibration" primaryText="Calibration" />
                      <MenuItem value="chained" primaryText="Chained" />
                    </SelectField>
                  </div>
                ),
              },
            ]}
          />
          <Stepper
            style={{
              display: 'none',
            }}
            activeStep={stepIndex}
            linear={false}
            orientation="vertical"
          >
            <Step>
              <StepButton
                onClick={() => this.setState({stepIndex: 0})}
              >Primary</StepButton>
              <StepContent>
                <Card
                  style={this.stepCardStyles}
                >
                  <CardText
                    className="form-fields"
                  >
                    <TextField
                      className="form-fields__item"
                      floatingLabelText="Title"
                    />
                    <TextField
                      className="form-fields__item"
                      floatingLabelText="Description"
                      multiLine={true}
                      rows={2}
                      rowsMax={4}
                    />
                    <p>Derived From</p>
                  </CardText>
                  <CardActions>
                    {this.renderStepActions(0)}
                  </CardActions>
                </Card>
              </StepContent>
            </Step>

            <Step>
              <StepButton
                icon={<WarningIcon color={red500} />}
                onClick={() => this.setState({stepIndex: 1})}
              >Boundary</StepButton>
              <StepContent>
                <p>An ad group contains one or more ads which target a shared set of keywords.</p>
                {this.renderStepActions(1)}
              </StepContent>
            </Step>

            <Step>
              <StepButton
                onClick={() => this.setState({stepIndex: 2})}
              >Inputs</StepButton>
              <StepContent>
                <Card
                  style={this.stepCardStyles}
                >
                  <CardText
                    className="form-fields"
                  >
                    <TextField
                      className="form-fields__item"
                      floatingLabelText="Prediction Years"
                    />
                    <TextField
                      className="form-fields__item"
                      floatingLabelText="Minimum Width"
                    />
                    <SelectField
                      floatingLabelText="Mean Variance"
                      value={meanVar}
                      onChange={this._bound_updateMeanVar}
                    >
                      <MenuItem value="none" primaryText="None" />
                      <MenuItem value="calibration" primaryText="Calibration" />
                      <MenuItem value="chained" primaryText="Chained" />
                    </SelectField>
                  </CardText>
                  <CardActions>
                    {this.renderStepActions(2)}
                  </CardActions>
                </Card>
              </StepContent>
            </Step>

            <Step>
              <StepButton
                onClick={() => this.setState({stepIndex: 3})}
              >Review</StepButton>
              <StepContent>
                <p>
                  Show validation results of each step here.
                </p>
                {this.renderStepActions(3)}
              </StepContent>
            </Step>
          </Stepper>
        </div>
      </MuiThemeProvider>
    );
  }
}
