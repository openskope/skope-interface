/**
 * Workspace page.
 *
 * `requestDatasetId` is derived from url.
 * `currentDatasetId` is the current loaded one.
 * When `requestDatasetId` is changed, for example by user navigating to a
 * different dataset, the new `requestDatasetId` is passed to the component.
 * The component should detect the change and call `loadNewDataset` to request
 * and load the new dataset.
 * `loadingConfigData` is `true` if the dataset config data is being loaded.
 * `configDataRequestError` and `configData` will contain the error and the
 * result from loading the new dataset config data, respectively.
 */

import {
  connect,
} from 'react-redux';
import { actions } from '/imports/ui/redux-store';

import Component from './component';

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const {
      workspace: {
        datasetId: currentDatasetId,
        configDataRequest,
        configDataRequestError,
        configData,
      },
    } = state;
    const {
      queryParams: {
        dataset: requestDatasetId = '',
      },
    } = ownProps;
    const loadingConfigData = !!(currentDatasetId && configDataRequest);

    return {
      currentDatasetId,
      requestDatasetId,
      loadingConfigData,
      configDataRequestError,
      configData,
    };
  },
  // mapDispatchToProps
  (dispatch) => ({
    loadNewDataset: (datasetId) => dispatch({
      type: actions.WORKSPACE_LOAD_DATASET.type,
      datasetId,
    }),
  }),
)(Component);
