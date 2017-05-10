import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import _ from "lodash";
import Component from "./component";

const filterMin = 1,
      filterMax = 2000;
const reactiveState = new ReactiveVar({
  error: null,
  result: null,
  request: null,
});

export default createContainer((props) => {
  // props here will have `main`, passed from the router
  // anything we return from this function will be *added* to it.

  const {
    queryParams: {
      filterValue: filterValueStr,
    },
  } = props;
  const filterValue = filterValueStr ? parseInt(filterValueStr) : filterMax;
  const state = reactiveState.get();

  console.info('container start', state, Date.now());

  if (!state.request || state.request.filterValue !== filterValue) {
    const request = {
      filterValue,
    };

    reactiveState.set({
      ...state,
      request,
      error: null,
      result: null,
    });

    Meteor.call("samples.get", request, (error, result) => {
      const state = Tracker.nonreactive(() => reactiveState.get());

      if (_.isEqual(state.request, request)) {
        reactiveState.set({
          ...state,
          error: error || null,
          result,
        });
      }

      console.info('data call end', Date.now());
    });
    console.info('data call start', Date.now());
  }

  const dataReady = Boolean(state.result);

  console.info('container end', Date.now());

  return {
    dataReady,
    data: {
      "type": "FeatureCollection",
      "features": dataReady ? state.result.items : [],
    },
    filterMin,
    filterMax,
    filterValue,
    channelDistributions: dataReady ? state.result.distributions : null,
  };
}, Component);
