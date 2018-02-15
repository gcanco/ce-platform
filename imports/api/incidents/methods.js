import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {_} from 'meteor/underscore';
import {Incidents} from "./incidents";
import {Availability} from "../coordinator/availability";
import {Assignments} from "../coordinator/assignments";
import {Submissions} from "../submissions/submissions";


export const startRunningIncident = function (incident) {

  console.log("incident in start", incident)
  let needUserMaps = [];

  _.forEach(incident.contributionTypes, (contribution) => {

    let templateName = contribution.templateName;

    _.forEach(contribution.needs, (need) => {

      needUserMaps.push({needName: need.needName})
      Submissions.insert({
        eid: incident.eid,
        iid: incident._id,
        needName: need.needName,
        templateName: templateName,
      }, (err, docs) => {
        if (err) {
          console.log("error,", err);
        } else {
        }
      });
    });
  });

  Availability.insert({
    _id: incident._id,
    needUserMaps: needUserMaps
  })

  Assignments.insert({
    _id: incident._id,
    needUserMaps: needUserMaps
  })

}

/**
 * Given an experience object, creates an incident
 * @param {string} iid of the created incident
 */
export const createIncidentFromExperience = function (experience) {

  let incident = {
    _id: Random.id(),
    eid: experience._id,
    callbacks: experience.callbacks,
    contributionTypes: experience.contributionTypes,
  }

  Incidents.insert(incident, (err, docs) => {
    if (err) {
      console.log("error,", err);
    } else {
      console.log("iid created")
    }
  });

  return incident;


}

/**
 * Finds the need dictionary in an incident given the need's name
 *
 * @param iid {string} incident id we are looking up a need in
 * @param needName {string} name of the need we are looking up
 */
export const getNeedFromIncidentId = (iid, needName) => {
  let incident = Incidents.findOne(iid);
  console.log("getNeedFromIncidentId", iid, needName )

  for (let i in incident.contributionTypes) {

    for (let j in incident.contributionTypes[i].needs) {
      console.log("neeeds", incident.contributionTypes[i].needs)
      let need = incident.contributionTypes[i].needs[j];

      if (need.needName === needName) {
        console.log("found need", need)
        return need;
      }
    }
  }

  //throw error();
}

//
// export const createIncident = new ValidatedMethod({
//   name: 'api.createIncident',
//   validate: new SimpleSchema({
//     experienceId: {
//       type: String
//     }
//   }).validator(),
//   run({experienceId}) {
//     //TODO: sometimes this runs too quickly after the experience was created
//     //we should be able to fix this
//     var experience = Experiences.findOne({_id:experienceId});
//     const incidentId = Incidents.insert({
//       date: Date.parse(new Date()),
//       name: experience.name,
//       experienceId: experience._id
//     }
//     );
//     Experiences.update( experience._id, { $set: { activeIncident: incidentId } });
//     return incidentId;
//   }
// });
//
// export const addSituationNeeds = new ValidatedMethod({
//   name: 'api.addSituationNeeds',
//   validate: new SimpleSchema({
//     incidentId:{
//       type: String
//     },
//     need:{
//       type: Schema.SituationNeed
//     }
//   }).validator(),
//   run({incidentId, need}){
//     var res = Incidents.update({_id: incidentId},
//       {$push: { situationNeeds: {
//         name:need.name,
//         affordance: need.affordance,
//         contributionTemplate:need.contributionTemplate,
//         softStoppingCriteria:need.softStoppingCriteria,
//         notifiedUsers: [],
//         done: false
//         }
//       }
//     });
//     return res;
//   }
// });
//

