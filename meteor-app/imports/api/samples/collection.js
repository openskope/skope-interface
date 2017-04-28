// Definition of the links collection

import { Mongo } from 'meteor/mongo';

export const Samples = new Mongo.Collection('samples');

export const channelValueMin = 0;
export const channelValueMax = 256;
