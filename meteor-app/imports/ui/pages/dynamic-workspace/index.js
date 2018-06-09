/**
 * Workspace page.
 *
 * `requestDatasetId` is derived from url.
 * `currentDatasetId` is the current loaded one.
 * When `requestDatasetId` is changed, for example by user navigating to a
 * different dataset, the new `requestDatasetId` is passed to the component.
 * The component should detect the change and call `loadNewDataset` to request
 * and load the new dataset.
 * `loadingDataset` is `true` if the dataset config data is being loaded.
 * `configDataRequestError` and `dataset` will contain the error and the
 * result from loading the new dataset config data, respectively.
 */

import objectPath from 'object-path';
import {
  connect,
} from 'react-redux';
import { actions } from '/imports/ui/redux-store';

import Component from './component';

const reduxNamespacePath = 'workspace.DynamicSuiteNS';

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const {
      routing,
      workspace: {
        datasetId: currentDatasetId,
        configDataRequest,
        configDataRequestError,
        dataset,
      },
    } = state;
    const {
      queryParams: {
        dataset: requestDatasetId = '',
      },
    } = ownProps;
    const loadingDataset = !!(currentDatasetId && configDataRequest);

    return {
      routing,
      currentDatasetId,
      requestDatasetId,
      loadingDataset,
      errorWhenLoadingDataset: configDataRequestError,
      dataset,
      suiteState: objectPath.get(state, reduxNamespacePath),
    };
  },
  // mapDispatchToProps
  (dispatch) => ({
    loadNewDataset: (datasetId) => dispatch({
      type: actions.WORKSPACE_LOAD_DATASET.type,
      datasetId,
    }),
    setSuiteState: (state, options = {}) => dispatch({
      type: actions.NAMESPACE_SET_STATE.type,
      namespacePath: reduxNamespacePath,
      state,
      options,
    }),
  }),
)(Component);
