/**
 * Model page for PaleoCAR model.
 */

import {
  connect,
} from 'react-redux';
import {
  formValueSelector,
} from 'redux-form';

import Component from './component';

const formName = 'model';
const selector = formValueSelector(formName);

const testingDefaultValues = {
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

const testingBoundaryShapes = {
  'boundary-a': '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-112.587890625,40.763901280945866],[-116.43310546875,37.43997405227057],[-109.2919921875,36.949891786813296],[-112.587890625,40.763901280945866]]]}}]}',
  'boundary-b': '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-114.63134765625001,39.35129035526705],[-115.20263671874999,37.735969208590504],[-109.75341796875,36.26199220445664],[-110.36865234374999,40.34654412118006],[-114.63134765625001,39.35129035526705]]]}}]}',
  'boundary-c': '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-108.34716796875,39.9602803542957],[-112.1484375,41.178653972331674],[-113.02734374999999,37.35269280367274],[-115.46630859375,37.38761749978395],[-110.0830078125,34.88593094075317],[-107.5341796875,37.125286284966776],[-104.23828125,34.615126683462194],[-104.21630859375,38.16911413556086],[-106.787109375,38.65119833229951],[-104.58984375,40.91351257612758],[-108.10546875,41.47566020027821],[-108.34716796875,39.9602803542957]]]}}]}',
};

export default connect(
  // mapStateToProps
  (state) => ({
    formName,
    defaultValues: testingDefaultValues[selector(state, 'derived-from')] || {},
    defaultMapExtent: [-125.771484375, 25.24469595130604, -66.181640625, 50.3454604086048],
    selectedBoundaryData: testingBoundaryShapes[selector(state, 'boundary')] || '',
  }),
  // mapDispatchToProps
  null,
)(Component);
