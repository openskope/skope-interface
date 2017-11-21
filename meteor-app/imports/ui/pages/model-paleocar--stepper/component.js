import React from 'react';
import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
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
import MapView from '/imports/ui/components/mapview';
import geojsonExtent from 'geojson-extent';

const renderHeader = () => (
  <AppbarHeader
    onClickHelpButton={() => alert('Show help for PaleoCAR model page.')}
  />
);

const renderBody = ({
  formName,
  defaultValues,
  defaultMapExtent,
  selectedBoundaryData,
}) => {
  const mapPreviewExtent = selectedBoundaryData
                           ? geojsonExtent(JSON.parse(selectedBoundaryData))
                           : defaultMapExtent;
  return (
    <div className="page-paleocar">
      <StepperForm
        name={formName}
        defaultValues={defaultValues}
        steps={[
          {
            name: 'primary',
            title: 'Primary',
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
              <div
                className="form-fields"
                style={{
                  minHeight: 200,
                }}
              >
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
                <FlatButton
                  label="Create New"
                  disableTouchRipple
                  disableFocusRipple
                />
                <div className="form-widget">
                  <MapView
                    className="mapview"
                    basemap="osm"
                    projection="EPSG:4326"
                    extent={mapPreviewExtent}
                    ref={(ref) => this._mapview = ref}
                  >{!selectedBoundaryData ? null : (
                    <map-layer-geojson src-json={selectedBoundaryData} />
                  )}</MapView>
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
  );
};

export default (props) => (
  <FullWindowLayout
    header={renderHeader()}
    body={renderBody(props)}
  />
);
