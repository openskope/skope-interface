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
import FlatButton from 'material-ui/FlatButton';
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

  static _testingBoundaryShapes = {
    'boundary-a': JSON.stringify({
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  -112.587890625,
                  40.763901280945866
                ],
                [
                  -116.43310546875,
                  37.43997405227057
                ],
                [
                  -109.2919921875,
                  36.949891786813296
                ],
                [
                  -112.587890625,
                  40.763901280945866
                ]
              ]
            ]
          }
        }
      ]
    }),
    'boundary-b': JSON.stringify({
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  -114.63134765625001,
                  39.35129035526705
                ],
                [
                  -115.20263671874999,
                  37.735969208590504
                ],
                [
                  -109.75341796875,
                  36.26199220445664
                ],
                [
                  -110.36865234374999,
                  40.34654412118006
                ],
                [
                  -114.63134765625001,
                  39.35129035526705
                ]
              ]
            ]
          }
        }
      ]
    }),
    'boundary-c': JSON.stringify({
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  -108.34716796875,
                  39.9602803542957
                ],
                [
                  -112.1484375,
                  41.178653972331674
                ],
                [
                  -113.02734374999999,
                  37.35269280367274
                ],
                [
                  -115.46630859375,
                  37.38761749978395
                ],
                [
                  -110.0830078125,
                  34.88593094075317
                ],
                [
                  -107.5341796875,
                  37.125286284966776
                ],
                [
                  -104.23828125,
                  34.615126683462194
                ],
                [
                  -104.21630859375,
                  38.16911413556086
                ],
                [
                  -106.787109375,
                  38.65119833229951
                ],
                [
                  -104.58984375,
                  40.91351257612758
                ],
                [
                  -108.10546875,
                  41.47566020027821
                ],
                [
                  -108.34716796875,
                  39.9602803542957
                ]
              ]
            ]
          }
        }
      ]
    }),
  };

  constructor (props) {
    super(props);

    this.state = {
      defaultValues: {},
      selectedBoundaryShape: this.constructor._testingBoundaryShapes['boundary-a'],
    };
  }

  _defaultValueSourceOnChange = (event, newSourceName) => {
    this.setState({
      defaultValues: this.constructor._testingDefaultValues[newSourceName],
    });
  };

  _boundarySelectionOnChange = (event, newBoundaryName) => {
    this.setState({
      selectedBoundaryShape: this.constructor._testingBoundaryShapes[newBoundaryName],
    });
  };

  render () {
    const {
      defaultValues,
      selectedBoundaryShape,
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
                  <div className="form-fields" style={{minHeight: 200}}>
                    <SelectField
                      name="boundary"
                      label="Available Boundaries"
                      className="form-fields__item"
                      validate={[
                        required,
                      ]}
                      onChange={this._boundarySelectionOnChange}
                    >
                      <MenuItem value="boundary-a" primaryText="Some Boundary A" />
                      <MenuItem value="boundary-b" primaryText="Some Boundary B" />
                      <MenuItem value="boundary-c" primaryText="Some Boundary C" />
                    </SelectField>
                    <FlatButton
                      label="Create New"
                      disableTouchRipple
                      disableFocusRipple
                    />
                    <div className="form-widget">
                      <map-view
                        class="mapview"
                        basemap="osm"
                        center="-12507655, 4695720"
                        zoom="5"
                        ref={(ref) => this._mapview = ref}
                      >{!selectedBoundaryShape ? null : (
                        <map-layer-geojson src-json={selectedBoundaryShape} />
                      )}</map-view>
                    </div>
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
