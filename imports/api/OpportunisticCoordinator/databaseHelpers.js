import { Mongo } from "meteor/mongo";
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema.js';

Schema.Assignment = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id,
  },
  needUserMaps: {
    type: [Schema.UserNeedMapping],
    blackbox: true
    //TODO: this shouldn't be blackbox true, figure out why it's not doing its thang
  },
});

export const Assignments = new Mongo.Collection('assignments');
Assignments.attachSchema(Schema.Assignment);

Schema.UserNeedMapping = new SimpleSchema({
  needName: {
    type: String
  },
  users: {
    type: [Object], // {uid: String, place: String, distance: Number}
    defaultValue: [],
    blackbox: true
  },
});
export const UserNeedMapping = new Mongo.Collection('userneedmapping');
UserNeedMapping.attachSchema(Schema.UserNeedMapping);

Schema.Availability = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id,
  },
  needUserMaps: {
    type: [Schema.UserNeedMapping],
    blackbox: true,
    //TODO: this shouldn't be blackbox true, figure out why it's not doing its thang
  },

});

export const Availability = new Mongo.Collection('availability');
Availability.attachSchema(Schema.Availability);
