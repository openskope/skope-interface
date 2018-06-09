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

const parseDatasetDocument = (datasetDoc) => {
  return {
    skopeid: datasetDoc.skopeid,
    status: datasetDoc.status,
    revised: datasetDoc.revised,
    title: datasetDoc.title,
    description: datasetDoc.description,
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
    })(datasetDoc.timespan),
    region: datasetDoc.region,
    type: datasetDoc.type,

    variables: ((items) => {
      const keyField = 'name';
      const mapOfOverlays = _.keyBy(datasetDoc.overlays, keyField);
      const mapOfAnalytics = _.keyBy(datasetDoc.analytics, keyField);
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
    })(datasetDoc.variables),
    overlays: datasetDoc.overlays,
    analytics: datasetDoc.analytics,
    downloads: datasetDoc.downloads,

    information: datasetDoc.information,
    overlayService: datasetDoc.overlayService,
    analyticService: datasetDoc.analyticService,
    downloadService: datasetDoc.downloadService,
    modelService: datasetDoc.modelService,
    provenanceService: datasetDoc.provenanceService,
  };
};

export
const WORKSPACE_RESOLVE_DATASET_DATA = scopedReducer((workspace, action) => {
  let {
    configDataRequest,
    configDataRequestError,
    dataset,
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
      dataset = null;
    } else {
      configDataRequest = null;
      configDataRequestError = null;
      dataset = parseDatasetDocument(action.data);
    }
  }

  return {
    ...workspace,

    configDataRequest,
    configDataRequestError,
    dataset,
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
    dataset,
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
    dataset = null;

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
    dataset = null;
  }

  return {
    ...workspace,

    datasetId,
    configDataRequest,
    configDataRequestError,
    dataset,

    // Reset state for the dynamic suite.
    DynamicSuiteNS: null,
  };
});
