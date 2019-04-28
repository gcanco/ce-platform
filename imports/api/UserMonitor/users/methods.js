import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const findUserByUsername = function (username) {
  return Meteor.users.findOne({ 'username': username });
};

export const _addActiveIncidentToUser = function (uid, iid) {
  Meteor.users.update({
    _id: uid
  }, {
    $addToSet: {
      'profile.activeIncidents': iid
    }
  });
};

export const _removeActiveIncidentFromUser = function (uid, iid) {
  Meteor.users.update({
    _id: uid
  }, {
    $pull: {
      'profile.activeIncidents': iid
    },
    $addToSet: {
      'profile.pastIncidents': iid
    }
  });

  // TODO(rlouie): remove the active incident/need/place/dist info too
};

export const _removeIncidentFromUserEntirely = function (uid, iid) {
  Meteor.users.update({
    _id: uid
  }, {
    $pull: {
      'profile.activeIncidents': iid
    }
  });

  // TODO(rlouie): remove the active incident/need/place/dist info too
};


export const getEmails = new ValidatedMethod({
  name: 'users.getEmails',
  validate: new SimpleSchema({
    users: {
      type: Array
    },
    'users.$': {
      type: Object
    }
  }).validator(),
  run({ users }) {
    return _.map(users, user => Meteor.users.findOne(user).emails[0]);
  }
});

export const removeFromAllActiveExperiences = new ValidatedMethod({
  name: 'users.removeFromAllActiveExperiences',
  validate: new SimpleSchema({
    experienceId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }

  }).validator(),
  run({ experienceId }) {
       return Meteor.users.update({}, { $pull: { 'profile.activeExperiences': experienceId } }, { multi: true });
  }
});

// Note: subscribe all users to all OCEs by running
// Experiences.find().fetch().forEach(function(elem, index, array) { Meteor.call('users.subscribeAllUsersToExperience', {experienceId: elem._id}); });
// in your console with all Experiences subscribed
export const subscribeAllUsersToExperience = new ValidatedMethod({
  name: 'users.subscribeAllUsersToExperience',
  validate: new SimpleSchema({
    experienceId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ experienceId }) {
    return Meteor.users.update({
      'profile.subscriptions': { $nin: [experienceId] }
    }, {
      $push: { 'profile.subscriptions': experienceId }
    }, {
      multi: true
    });
  }
});

export const subscribeUserToExperience = new ValidatedMethod({
  name: 'users.subscribeUserToExperience',
  validate: new SimpleSchema({
    experienceId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ experienceId }) {
    return Meteor.users.update({
      _id: this.userId,
      'profile.subscriptions': { $nin: [experienceId] }
    }, { $push: { 'profile.subscriptions': experienceId } });
  }
});

export const unsubscribeUserFromExperience = new ValidatedMethod({
  name: 'users.unsubscribeUserFromExperience',
  validate: new SimpleSchema({
    experienceId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ experienceId }) {
    return Meteor.users.update({
      _id: this.userId,
      'profile.subscriptions': experienceId
    }, { $pull: { 'profile.subscriptions': experienceId } });
  }
});
