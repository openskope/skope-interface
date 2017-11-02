import React from 'react';
import {
  Field,
} from 'redux-form';
import MaterialTextField from 'material-ui/TextField';
import MaterialSelectField from 'material-ui/SelectField';

export const TextField = ((component) => (props) => <Field {...props} component={component} />)(({
  input,
  label,
  meta: { touched, error },
  ...custom
}) => (
  <MaterialTextField
    floatingLabelText={label}
    errorText={touched && error}
    {...input}
    {...custom}
  />
));

export const SelectField = ((component) => (props) => <Field {...props} component={component} />)(({
  input,
  label,
  meta: { touched, error },
  children,
  ...custom
}) => (
  <MaterialSelectField
    floatingLabelText={label}
    errorText={touched && error}
    {...input}
    onChange={(event, index, value) => input.onChange(value)}
    {...custom}
  >{children}</MaterialSelectField>
));
