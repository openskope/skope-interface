import React from 'react';
import PropTypes from 'prop-types';

import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
import WorkspaceTitle from '/imports/ui/components/workspace-title';
import {
  IndeterminateProgress,
} from '/imports/ui/components/LinearProgress';

import {
  PropPrinter,
} from '/imports/helpers/ui';
import {
  NOOP,
} from '/imports/helpers/model';

import DynamicWorkspaceSuite from './DynamicWorkspaceSuite';

const checkToLoadNewDataset = (props) => {
  const {
    currentDatasetId,
    requestDatasetId,
    loadNewDataset,
  } = props;

  if (currentDatasetId !== requestDatasetId) {
    loadNewDataset(requestDatasetId);
    return true;
  }

  return false;
};

const RootElement = ({
  children,
  ...props
}) => (
  <div
    {...props}
    className="page-workspace"
  >{children}</div>
);

export default
class WorkspacePage extends React.Component {

  static propTypes = {
    // ID of the dataset currently loaded. Empty string indicating no dataset is loaded.
    currentDatasetId: PropTypes.string.isRequired,
    // ID of the dataset to be loaded.
    // Empty string indicates no dataset should be loaded and current data should be discarded.
    // This should eventually match `currentDatasetId`.
    requestDatasetId: PropTypes.string.isRequired,
    // True if the requested dataset is being loaded.
    loadingConfigData: PropTypes.bool.isRequired,
    // Any error encountered during requesting the config data.
    configDataRequestError: PropTypes.object,
    // The config data object.
    configData: PropTypes.object,
    // Callback to load new dataset (when requestDatasetId mis-matches currentDatasetId).
    loadNewDataset: PropTypes.func,
    // Path to the namespace in Redux store for this.
    reduxNamespacePath: PropTypes.string,
  };

  static defaultProps = {
    configDataRequestError: null,
    configData: null,
    loadNewDataset: NOOP,
    reduxNamespacePath: '',
  };

  constructor (props) {
    super(props);

    checkToLoadNewDataset(props);
  }

  componentWillReceiveProps (nextProps) {
    checkToLoadNewDataset(nextProps);
  }

  renderBody () {
    const {
      currentDatasetId,
      loadingConfigData,
      configDataRequestError,
    } = this.props;

    if (!currentDatasetId) {
      return this.renderEmptyView();
    } else if (loadingConfigData) {
      return this.renderLoadingView();
    } else if (configDataRequestError) {
      return this.renderLoadingErrorView();
    }

    return this.renderLoadedView();
  }

  //! Improve empty view.
  renderEmptyView = () => (
    <RootElement>
      No dataset to load.
    </RootElement>
  );

  //! Improve loading view.
  renderLoadingView = () => (
    <RootElement>
      <IndeterminateProgress />
      <p>Loading...</p>
    </RootElement>
  );

  //! Improve error view.
  renderLoadingErrorView () {
    const {
      configDataRequestError,
    } = this.props;

    return (
      <RootElement>
        <h1>Error</h1>
        <PropPrinter
          {...{
            configDataRequestError,
          }}
        />
      </RootElement>
    );
  }

  renderLoadedView () {
    const {
      configData,
      reduxNamespacePath,
    } = this.props;
    
    return (
      <RootElement>
        <DynamicWorkspaceSuite
          reduxNamespacePath={reduxNamespacePath}
          suiteType={`WORKSPACE_SUITE__${String(configData.type).toUpperCase()}`}
          suiteProps={configData}
        />
      </RootElement>
    );
  }

  render () {
    return (
      <FullWindowLayout
        header={<AppbarHeader title={<WorkspaceTitle />} />}
        body={this.renderBody()}
      />
    );
  }
}
