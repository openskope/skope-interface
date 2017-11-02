import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import customTheme from '/imports/ui/styling/muiTheme';
import {
  TextField,
  SelectField,
} from '/imports/ui/components/redux-form-controls';
import {
  required,
  maxLength15,
  minLength2,
} from '/imports/ui/components/redux-form-validators';
import MenuItem from 'material-ui/MenuItem';
import StepperForm from '/imports/ui/components/stepper-form';

export default class ModelPage extends React.Component {

  static _testingDefaultValues = {
    'sample-a': {
      boundary: 'boundary-a',
      'prediction-years': '1000',
    },
    'sample-b': {
      boundary: 'boundary-b',
      'prediction-years': '1500',
    },
    'sample-c': {
      boundary: 'boundary-c',
      'prediction-years': '2000',
    },
  };

  constructor (props) {
    super(props);

    this.state = {
      defaultValues: {},
    };
  }

  _defaultValueSourceOnChange = (event, newSourceName) => {
    this.setState({
      defaultValues: this.constructor._testingDefaultValues[newSourceName],
    });
  };

  render () {
    const {
      defaultValues,
    } = this.state;

    return (
      <MuiThemeProvider muiTheme={customTheme}>
        <div className="page-paleocar">
          <StepperForm
            name="model"
            defaultValues={defaultValues}
            steps={[
              {
                name: 'primary',
                title: 'Primary',
                //! This function should be able to return some error message.
                //! This validation error should automatically block advancing.
                validation: (fields) => {
                  const errors = {};

                  if (fields.title !== 'secret') {
                    errors.title = 'Please type in "secret"';
                  }

                  return errors;
                },
                content: (
                  <div className="form-fields">
                    <TextField
                      name="title"
                      label="Title"
                      className="form-fields__item"
                      autoComplete="off"
                      validate={[
                        required,
                        maxLength15,
                        minLength2,
                      ]}
                    />
                    <TextField
                      name="description"
                      label="Description"
                      className="form-fields__item"
                      autoComplete="off"
                      multiLine
                      rows={2}
                      rowsMax={4}
                    />
                    <SelectField
                      name="derived-from"
                      label="Derived From"
                      className="form-fields__item"
                      validate={[
                        required,
                      ]}
                      onChange={this._defaultValueSourceOnChange}
                    >
                      <MenuItem value="sample-a" primaryText="Sample A" />
                      <MenuItem value="sample-b" primaryText="Sample B" />
                      <MenuItem value="sample-c" primaryText="Sample C" />
                    </SelectField>
                  </div>
                ),
              },
              {
                name: 'boundary',
                title: 'Boundary',
                content: (
                  <div className="form-fields">
                    <SelectField
                      name="boundary"
                      label="Available Boundaries"
                      className="form-fields__item"
                      validate={[
                        required,
                      ]}
                    >
                      <MenuItem value="boundary-a" primaryText="Some Boundary A" />
                      <MenuItem value="boundary-b" primaryText="Some Boundary B" />
                      <MenuItem value="boundary-c" primaryText="Some Boundary C" />
                    </SelectField>
                  </div>
                ),
              },
              {
                name: 'inputs',
                title: 'Inputs',
                content: (
                  <div className="form-fields">
                    <TextField
                      name="prediction-years"
                      label="Prediction Years"
                      className="form-fields__item"
                      autoComplete="off"
                      validate={[
                        required,
                      ]}
                    />
                    <TextField
                      name="min-width"
                      label="Minimum Width"
                      className="form-fields__item"
                      autoComplete="off"
                      validate={[
                        required,
                      ]}
                    />
                    <SelectField
                      name="mean-variance"
                      label="Mean Variance"
                      className="form-fields__item"
                      validate={[
                        required,
                      ]}
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
        </div>
      </MuiThemeProvider>
    );
  }
}
