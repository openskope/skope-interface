import {
  Meteor,
} from 'meteor/meteor';
import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import store, { actions } from '/imports/ui/redux-store';
import {
  scopedReducerCreator,
} from '/imports/ui/redux-store/helpers';
import {
  getPrecisionByResolution,
  parseDateStringWithPrecision,
} from '/imports/helpers/model';

/**
 * Restricts the scope of the reducer to a certain field in the state.
 * @param  {Function} reducer
 * @return {Function}
 */
const scopedReducer = (reducer) => scopedReducerCreator('workspace', reducer);

const parseDatasetConfigData = (configData) => {
  return {
    skopeid: configData.skopeid,
    status: configData.status,
    revised: configData.revised,
    title: configData.title,
    description: configData.description,
    timespan: (({ name, resolution, period }) => {
      const precision = getPrecisionByResolution(resolution);

      return {
        name,
        resolution,
        precision,
        period: {
          gte: parseDateStringWithPrecision(period.gte, precision),
          lte: parseDateStringWithPrecision(period.lte, precision),
        },
      };
    })(configData.timespan),
    region: configData.region,
    type: configData.type,

    variables: ((items) => {
      const keyField = 'name';
      const mapOfOverlays = _.keyBy(configData.overlays, keyField);
      const mapOfAnalytics = _.keyBy(configData.analytics, keyField);
      const variables = items.map((v) => {
        const key = v[keyField];

        if (!key) {
          return null;
        }

        return {
          ...v,
          overlay: mapOfOverlays[key],
          analytics: mapOfAnalytics[key],
        };
      });
      const mapOfVariables = _.keyBy(variables, keyField);

      return mapOfVariables;
    })(configData.variables),
    overlays: configData.overlays,
    analytics: configData.analytics,
    downloads: configData.downloads,

    information: configData.information,
    overlayService: configData.overlayService,
    analyticService: configData.analyticService,
    downloadService: configData.downloadService,
    modelService: configData.modelService,
    provenanceService: configData.provenanceService,
  };
};

export
const WORKSPACE_RESOLVE_DATASET_DATA = scopedReducer((workspace, action) => {
  let {
    configDataRequest,
    configDataRequestError,
    configData,
  } = workspace;

  if (
    configDataRequest
    && configDataRequest.requestId === action.requestId
    && configDataRequest.datasetId === action.datasetId
  ) {
    if (action.error) {
      //! handle error?

      configDataRequest = null;
      configDataRequestError = action.error;
      configData = null;
    } else {
      configDataRequest = null;
      configDataRequestError = null;
      configData = action.data;
    }
  }

  return {
    ...workspace,

    configDataRequest,
    configDataRequestError,
    configData,
    dataset: parseDatasetConfigData(configData),
  };
});

export
const WORKSPACE_LOAD_DATASET = scopedReducer((workspace, action) => {
  const {
    datasetId: newDatasetId,
  } = action;
  let {
    datasetId,
    configDataRequest,
    configDataRequestError,
    configData,
  } = workspace;

  // Dataset ID could be empty, which means unloading dataset.
  if (newDatasetId) {
    // Load new dataset.
    const requestId = uuidv4();

    datasetId = newDatasetId;
    configDataRequest = {
      datasetId: newDatasetId,
      requestId,
    };
    configDataRequestError = null;
    configData = null;

    Meteor.call(
      'datasetManifest.get',
      {
        datasetId,
      },
      (error, data) => {
        // Defer this action so the error is disconnected with `Meteor.call`.
        _.defer(() => {
          store.dispatch({
            type: actions.WORKSPACE_RESOLVE_DATASET_DATA.type,
            datasetId,
            requestId,
            error,
            data,
          });
        });
      },
    );
  } else {
    // Unload data.
    datasetId = '';
    configDataRequest = null;
    configDataRequestError = null;
    configData = null;
  }

  return {
    ...workspace,

    datasetId,
    configDataRequest,
    configDataRequestError,
    configData,

    // Reset state for the dynamic suite.
    DynamicSuiteNS: null,
  };
});
