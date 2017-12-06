import React from 'react';
import PropTypes from 'prop-types';

import FullWindowLayout from '/imports/ui/layouts/full-window';
import AppbarHeader from '/imports/ui/components/appbar';
import WorkspaceTitle from '/imports/ui/components/workspace-title';

import * as Suites from '/imports/ui/components/workspace-suites';
import {
  PropPrinter,
} from '/imports/ui/helpers';

export default class WorkspacePage extends React.Component {

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
  };

  static defaultProps = {
    configDataRequestError: null,
    configData: null,
  };

  static _checkToLoadNewDataset (props) {
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
  }

  static RootElement = ({
    children,
    ...props
  }) => (
    <div
      {...props}
      className="page-workspace"
    >{children}</div>
  );

  constructor (props) {
    super(props);

    this.constructor._checkToLoadNewDataset(props);
  }

  componentWillReceiveProps (nextProps) {
    this.constructor._checkToLoadNewDataset(nextProps);
  }

  renderHeader = () => (
    <AppbarHeader
      title={<WorkspaceTitle />}
      onClickHelpButton={() => alert('Show help for workspace page.')}
    />
  );

  renderBody = ({
    currentDatasetId,
    loadingConfigData,
    configDataRequestError,
  } = this.props) => {
    if (!currentDatasetId) {
      return this.renderEmptyView();
    } else if (loadingConfigData) {
      return this.renderLoadingView();
    } else if (configDataRequestError) {
      return this.renderLoadingErrorView();
    }

    return this.renderLoadedView();
  };

  //! Improve empty view.
  renderEmptyView = () => (
    <this.constructor.RootElement>
      No dataset to load.
    </this.constructor.RootElement>
  );

  //! Improve loading view.
  renderLoadingView = () => (
    <this.constructor.RootElement>
      Loading...
    </this.constructor.RootElement>
  );

  //! Improve error view.
  renderLoadingErrorView = ({
    configDataRequestError,
  } = this.props) => (
    <this.constructor.RootElement>
      <h1>Error</h1>
      <PropPrinter
        {...{
          configDataRequestError,
        }}
      />
    </this.constructor.RootElement>
  );

  renderLoadedView = ({
    configData,
  } = this.props) => {
    const suiteType = `WORKSPACE_SUITE__${String(configData.type).toUpperCase()}`;

    if (suiteType in Suites) {
      const WorkspaceSuite = Suites[suiteType];
      return (
        <this.constructor.RootElement>
          <WorkspaceSuite {...configData.data} />
        </this.constructor.RootElement>
      );
    }

    return (
      <this.constructor.RootElement>
        <h1>Invalid Suite Type</h1>
        <PropPrinter {...configData} />
      </this.constructor.RootElement>
    );
  };

  render = () => (
    <FullWindowLayout
      header={this.renderHeader()}
      body={this.renderBody()}
    />
  );
}
