import { Meteor } from 'meteor/meteor';
import {Assignments, ParticipatingNow} from "../databaseHelpers";
import {Availability} from "../databaseHelpers";
import {Notification_log} from "../../Logging/notification_log";

Meteor.publish('assignments.all', function () {
  return Assignments.find();
});

Meteor.publish('availability.all', function () {
  return Availability.find();
});

Meteor.publish('assignments.single', function (assignmentId) {
  return Assignments.find({_id: assignmentId});
});

Meteor.publish('assignments.activeUser', function () {
  //console.log('subscribing to assignments.activeUser');

  if (!this.userId) {
    this.ready();
  } else {
    return Assignments.find({
      'needUserMaps.users': {
        '$elemMatch': {
          'uid': this.userId
        }
      }
    });
  }
});


Meteor.publish('notification_log.activeIncident', function (iid) {
  return Notification_log.find({iid: iid});
});

Meteor.publish('participating.now.activeIncident', function (iid) {
  return ParticipatingNow.find({_id: iid});
});