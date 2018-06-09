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

import * as Suites from './suites';

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
    loadingDataset: PropTypes.bool.isRequired,
    // Any error encountered during requesting the config data.
    errorWhenLoadingDataset: PropTypes.object,
    // The dataset document.
    dataset: PropTypes.object,
    suiteState: PropTypes.object,
    routing: PropTypes.object,
    // Callback to load new dataset (when requestDatasetId mis-matches currentDatasetId).
    loadNewDataset: PropTypes.func,
    setSuiteState: PropTypes.func,
  };

  static defaultProps = {
    errorWhenLoadingDataset: null,
    dataset: null,
    suiteState: null,
    routing: null,
    loadNewDataset: NOOP,
    setSuiteState: NOOP,
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
      loadingDataset,
      errorWhenLoadingDataset,
    } = this.props;

    if (!currentDatasetId) {
      return this.renderEmptyView();
    } else if (loadingDataset) {
      return this.renderLoadingView();
    } else if (errorWhenLoadingDataset) {
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
      errorWhenLoadingDataset,
    } = this.props;

    return (
      <RootElement>
        <h1>Error</h1>
        <PropPrinter
          {...{
            errorWhenLoadingDataset,
          }}
        />
      </RootElement>
    );
  }

  renderValidSuite (Component) {
    const {
      routing,
      dataset,
      suiteState,
      setSuiteState,
    } = this.props;

    return (
      <Component
        {...dataset}
        routing={routing}
        suiteState={suiteState}
        setSuiteState={setSuiteState}
      />
    );
  }

  renderInvalidSuiteErrorView () {
    const {
      dataset,
    } = this.props;

    return (
      <div>
        <h1>Invalid Suite Type</h1>
        <PropPrinter
          {...dataset}
        />
      </div>
    );
  }

  renderLoadedView () {
    const {
      dataset,
    } = this.props;
    const suiteType = `WORKSPACE_SUITE__${String(dataset.type).toUpperCase()}`;
    const suiteComponent = Suites[suiteType];
    const suiteElement = suiteComponent ? this.renderValidSuite(suiteComponent) : this.renderInvalidSuiteErrorView();

    return (
      <RootElement>{suiteElement}</RootElement>
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
