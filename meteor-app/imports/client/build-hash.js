/**
 * Since this value needs to be fetched from server, instead of exporting the
 * value directly, we rely on two functions, one reads the value and the other
 * registers callbacks when the value is ready.
 *
 * The value should always be `null` when loading is not complete or failed.
 * The `onReady` function should call the callback immediately if the value is
 * already ready.
 */

import { Meteor } from 'meteor/meteor';

let callbacks = [];
let loadingComplete = false;
let loadingError = null;
let value = null;

export
const getValue = () => {
  return loadingComplete ? value : null;
};

const triggerCallback = (func) => {
  func(loadingError, value);
};

Meteor.call('buildHash', (error, buildHash) => {
  loadingComplete = true;

  value = buildHash;

  if (error) {
    loadingError = error;
  } else {
    value = buildHash;
  }

  const _callbacks = callbacks;
  callbacks = [];

  _callbacks.forEach(triggerCallback);
});

export
const onReady = (func) => {
  if (loadingComplete) {
    triggerCallback(func);
  } else {
    callbacks.push(func);
  }
};
