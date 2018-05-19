/**
 * Workspace page.
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
