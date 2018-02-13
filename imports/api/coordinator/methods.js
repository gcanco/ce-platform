import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {_} from 'meteor/underscore';

import {Cerebro} from '../cerebro/server/cerebro-server.js';
import {Experiences} from '../experiences/experiences.js';
import {Incidents} from '../incidents/incidents.js';
import {Locations} from '../locations/locations.js';
import {Submissions} from '../submissions/submissions.js';
import {NotificationLog} from '../cerebro/cerebro-core.js'

import {Users} from '../users/users.js';
import {
  _addActiveIncidentToUsers, _removeActiveIncidentFromUsers,
  removeActiveIncidentFromUsers
} from "../users/methods";
import {Assignments} from "./assignments";
import {Availability} from "./availability";
import {doesUserMatchNeed} from "../experiences/methods";


/**
 * Runs the coordinator after a location update has occured.
 *
 * @param uid {string} user whose location just updated
 * @param availabilityDictionary {object} current availabilities as {iid: [need, need], iid: [need]}
 */
export const runCoordinatorAfterUserLocationChange = function (uid, availabilityDictionary) {
  // update availabilities of users and check if any experience incidents can be run
  let updatedAvailability = updateAvailability(uid, availabilityDictionary);
  let incidentsWithUsersToRun = checkIfThreshold(updatedAvailability);

  // add users to incidents to be run
  runNeedsWithThresholdMet(incidentsWithUsersToRun);
};




/**
 * Sends notifications to the users, adds to the user's active experience list, marks in assignment DB 2b
 * @param incidentsWithUsersToRun {object} needs to run in format of { iid: { need: [uid, uid], need:[uid] }
 */
function runNeedsWithThresholdMet(incidentsWithUsersToRun) { //{iid: {need: [uid, uid], need:[uid]}

  _.forEach(incidentsWithUsersToRun, (needUserMapping, iid) => {
    let incident = Incidents.findOne(iid);
    let experience = Experiences.findOne(incident.eid)

    _.forEach(needUserMapping, (uids, needName) => {
      //administrative updates
      adminUpdatesForAddingUsersToIncident(uids, iid, needName);

      let route = "apiCustom/" + iid + "/" + needName;
      notify(uids, iid, "Event " + experience.name + " is starting!", experience.notificationText, route)
    });
  });
}





//check if an experience need can run e.g. it has the required number of people. This may call other functions that, for example, check for relationship, colocated, etc.

function checkIfThreshold(updatedExperiencesAndNeeds) {
  return {eid: {need: [uid, uid], need: [uid]}}
}

/**
 * AVAILABILITY DB FUNCTIONS
 */

/**
 * Updates the database with the availabilities of a user.
 *
 * @param uid {string}
 * @param availabilityDictionary {object} current availabilities as {iid: [need, need], iid: [need]}
 * @return {object} object from Availability that were updated
 */

export const updateAvailability = function(uid, availabilityDictionary) {
  // TODO: code review with Kapil
  var updatedEntries = [];

  //remove user from all entries
  Availability.update({
    "needs": {"$elemMatch":{"users": uid}}
  }, {
    $pull: {"needs.$.users": uid}
  },{
    multi:true
  });

  _.forEach(availabilityDictionary, (needNames, iid)=>{
    let newEntry = {};
    newEntry[iid] = []

    _.forEach(needNames, (needName)=>{
      newEntry[iid].push(needName);

      Availability.update({
        iid: iid, "needs.needName": needName
      }, {
        $push: {"needs.$.users": uid}
      });

    });

    updatedEntries.push(newEntry);

  });

  return updatedEntries;
}


/**
 * ASSIGNMENT DB FUNCTIONS
 */

/**
 * Un-assigns a user to an incident if their location no longer matches
 * Also removes the active experience from the user
 *
 * @param uid {string} user to update assignment for
 * @param lat {float} latitude of user's new location
 * @param lng {float} longitude of user's new location
 */
export const updateAssignmentDbdAfterUserLocationChange = function(uid, lat, lng) {
  //TODO: code review with kapil
  let currentAssignments = Assignments.find({
    "needs": {"$elemMatch":{"users": uid}}
  }).fetch();

  _.forEach(currentAssignments, (assignment)=>{
    _.forEach(assignment.needs, (need)=>{
      let matchPredicate = doesUserMatchNeed(uid, lat, lng, assignment.iid, need.needName);
      if(!matchPredicate){
        adminUpdatesForRemovingUsersToIncident([uid], assignment.iid, need.needName);
      }

    });
  });
}

/**
 *
 * @param uids {[string]} users to add
 * @param iid {string} incident to add users to
 * @param needName {string} name of need to add users to
 */
function adminUpdatesForAddingUsersToIncident(uids, iid, needName){
  _addUsersToAssignmentDb(uids, iid, needName);
  _addActiveIncidentToUsers(uids, iid);
}

/**
 *
 * @param uids {[string]} users to remove
 * @param iid {string} incident to remove users from
 * @param needName {string} name of need to remove users from
 */
function adminUpdatesForRemovingUsersToIncident(uids, iid, needName){
  _removeUsersFromAssignmentDb(uid, iid, needName);
  _removeActiveIncidentFromUsers(uids, iid)
}


/**
 * Adds all users in the array to the assignmentDB for the specified need.
 *
 * @param uids {[string]} users to add
 * @param iid {string} incident to add to
 * @param needName {string} need to add user to
 */
function _addUsersToAssignmentDb(uids, iid, needName) {
  Assignments.update({
    iid: iid,
    "needs.needName": needName
  }, {
    $push: {"needs.$.users": {$each: uids}}
  });
}

/**
 * Removes user from assignmentDB for the specified need.
 *
 * @param uid {string} user to remove
 * @param iid {string} incident to remove from
 * @param needName {string} need that user is assigned to
 */
function _removeUsersFromAssignmentDb(uids, iid, needName) {
  Assignments.update({
    iid: iid,
    "needs.needName": needName
  }, {
    $pull: {"needs.$.users": {$each: uids}}
  });
}





const locationCursor = Locations.find();

/**
 * a DB listener that responds when a user's location field changes, this includes
 *    lat/long and the affordance array
 */
const locationHandle = locationCursor.observeChanges({
  changed(id, fields) {
    console.log("the location field changed", fields)

    if ("lastNotification" in fields) {
      return;
    }

    //check if now that they've moved they...
    var location = Locations.findOne({_id: id});
    var uid = location.uid;

    //need to be removed from an experience they're currently in
    var user = Meteor.users.findOne({_id: uid})
    var usersExperiences = user.profile.activeExperiences
    if (usersExperiences) {
      usersExperiences.forEach((experienceId) => {
        removeUserFromExperienceAfterTheyMoved(uid, experienceId)
      })
    }

    if ("affordances" in fields) {
      AvailabilityLog.insert({
        uid: uid,
        lastParticipated: user.profile.lastParticipated,
        lastNotified: location.lastNotification,
        affordances: location.affordances,
        lat: location.lat,
        lng: location.lng,
        now: Date.parse(new Date()),
      });
    }

    //check if user to available to participate right now
    if (!userIsAvailableToParticipate(user, location)) {
      console.log("user participated too recently")
      return;
    }

    //can be added to a new experience
    var allExperiences = Experiences.find({activeIncident: {$exists: true}}).fetch()

    //could randomize the order of experiences
    console.log("at the top of the for loops")
    var shuffledExperiences = _.shuffle(allExperiences)
    for (var i in shuffledExperiences) {
      var experience = shuffledExperiences[i];
      var result = attemptToAddUserToIncident(uid, experience.activeIncident);
      console.log("result", result)
      if (result) {
        console.log("We found an experience for the user and now are stopping")
        break;
      }
    }
  }
});


/**
 * userIsAvailableToParticipate - checks if a user can participate or if they not
 *    available to participate because they were notified too recently
 *
 * @param  {user document} user     user document
 * @param  {location document} location location document for that user
 * @return {bool}          true if a user can participate
 */
function userIsAvailableToParticipate(user, location) {
  var waitTimeAfterNotification = 30 * 60000; //first number is the number of minutes
  var waitTimeAfterParticipating = 60 * 60000;//first number is the number of minutes

  var lastParticipated = user.profile.lastParticipated;
  var lastNotified = location.lastNotification;

  var now = Date.parse(new Date());

  var userNotYetNotified = lastParticipated === null
  var userNotifiedTooRecently = (now - lastNotified) < waitTimeAfterNotification
  var userNotYetParticipated = lastNotified === null
  var userParticipatedTooRecently = (now - lastParticipated) < waitTimeAfterParticipating

  if ((!userNotYetNotified && userNotifiedTooRecently) || (!userNotYetParticipated && userParticipatedTooRecently)) {
    return false;
  }
  else {
    return true;
  }
}

function attemptToAddUserToIncident(uid, incidentId) {
  var incident = Incidents.findOne({_id: incidentId});
  var userAffordances = Locations.findOne({uid: uid}).affordances
  var minParticipation = Math.min(); //this is infinity
  var minSituationNeed = null;

  incident.situationNeeds.forEach((sn) => {
    if (sn.done === false && containsAffordance(userAffordances, sn.affordance)) {
      //need has a user, but lets see if time to kick them out
      if (sn.notifiedUsers.length > 0) {
        var timeSinceUserLastNotified = Date.parse(new Date()) - Locations.findOne({uid: sn.notifiedUsers[0]}).lastNotified
        if (timeSinceUserLastNotified > 30 * 60000) { //time in minutes since they were asked to participate in any experience
          removeUserFromExperience(sn.notifiedUsers[0], incident.experienceId, 2)
        } else {
          //we have a user already for this need, skip and see if the next one is open
          return false;
        }
      }
      var numberDone = Submissions.find({incidentId: incident._id, situationNeed: sn.name}).count()
      if (numberDone < minParticipation) {
        minSituationNeed = sn.name;
      }
    }
  });
  if (minSituationNeed != null) {
    addUserToSituationNeed(uid, incidentId, minSituationNeed)
    return true;
  }
  return false;
}

function addUserToSituationNeed(uid, incidentId, situationNeedName) {
  var experience = Experiences.findOne({activeIncident: incidentId});
  var experienceId = experience._id;

  //add active experience to the user
  Cerebro.setActiveExperiences(uid, experienceId);

  //add user to the incident
  Incidents.update(
    {_id: incidentId, 'situationNeeds.name': situationNeedName},
    {
      $push:
        {'situationNeeds.$.notifiedUsers': uid}
    }
  );
  //notify the user & mark as notified
  Locations.update({uid: uid}, {$set: {"lastNotification": Date.parse(new Date())}});

  //add notification to notification log
  var userLocation = Locations.findOne({uid: uid})
  NotificationLog.insert({
    userId: uid,
    task: situationNeedName,
    lat: userLocation.lat,
    lng: userLocation.lng,
    experienceId: experienceId,
    incidentId: incidentId
  });

  //send notification
  Cerebro.notify({
    userId: uid,
    experienceId: experienceId,
    subject: "Event " + experience.name + " is starting!",
    text: experience.notificationText,
    route: "apiCustom"
  });
}

function removeUserFromExperience(uid, experienceId, incidentId, situationNeedName) {
  //remove the user from the incident
  console.log("removeing the user")
  Incidents.update({_id: incidentId, 'situationNeeds.name': situationNeedName},
    {
      $pull:
        {'situationNeeds.$.notifiedUsers': uid}
    });

  //remove the experience from the user
  Meteor.users.update({_id: uid},
    {
      $pull:
        {'profile.activeExperiences': experienceId}
    }
  );
}

export const removeUserAfterTheyParticipated = function (uid, experienceId) {
  var userAffordances = Locations.findOne({uid: uid}).affordances
  var incident = Incidents.findOne({experienceId: experienceId});

  for (var i in incident.situationNeeds) {
    var sn = incident.situationNeeds[i]
    console.log(sn.name)
    if (_.contains(sn.notifiedUsers, uid)) {
      removeUserFromExperience(uid, experienceId, incident._id, sn.name)
      break;
    }
  }
  ;
}

function removeUserFromExperienceAfterTheyMoved(uid, experienceId) {
  var userAffordances = Locations.findOne({uid: uid}).affordances
  var incident = Incidents.findOne({experienceId: experienceId});
  var wait = 5 * 60 * 1000; //WAIT LAG (in minutes) FOR AFTER A USER LEAVES A SITUATION

  Meteor.setTimeout(function () {
    console.log("we're removing the userrzz")
    for (var i in incident.situationNeeds) {
      var sn = incident.situationNeeds[i]
      if (_.contains(sn.notifiedUsers, uid)) {
        if (!containsAffordance(userAffordances, sn.affordance)) {
          console.log("found the one to remove from!")
          removeUserFromExperience(uid, experienceId, incident._id, sn.name)
          //a user will only be in one situation need, so we can break
          break;
        }
      }
    }
    ;
  }, wait)
}


// METHODS FOR AFFORDANCE SEARCH
function containsAffordance(user_affordances, search_affordance) {
  // && affordances
  if (search_affordance.search(" and ") > 0) {
    return andAffordances(user_affordances, search_affordance);
  }
  // || affordances
  else if (search_affordance.search(" or ") > 0) {
    return orAffordances(user_affordances, search_affordance);
  }
  // single affordance
  else {
    return (_.contains(user_affordances, search_affordance));
  }
}

function andAffordances(user_affordances, search_affordance) {
  let affordances = [];
  let str = search_affordance;
  affordances = search_affordance.split(" and ");
  differences = _.difference(affordances, user_affordances)
  return differences.length == 0
}

function orAffordances(user_affordances, search_affordance) {
  let affordances = [];
  let contains = false;
  affordances = search_affordance.split(" or ");
  for (i = 0; i < affordances.length; i++) {
    anAffordance = affordances[i];
    if (_.contains(user_affordances, anAffordance)) {
      contains = true;
      break;
    }
  }
  return contains;
}
