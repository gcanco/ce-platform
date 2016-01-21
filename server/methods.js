Meteor.methods({
  sendEmail: function(from, subject, text, expId) {

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    let users = Meteor.users.find({
      'profile.experiences': expId
    }).forEach((user) => {
      let email = user.emails[0].address;
      // MAIL_URL="smtp://postmaster@sandbox31e59e1446774315b14003638c8f64ba.mailgun.org:fe2c40e92b55de91104c823fdec0967c@smtp.mailgun.org:587" meteor
      Email.send({
        to: email,
        from: from,
        subject: subject,
        html: text
      });
    });
  },
  updateUserExperiences: function() {
    let exps = Experiences.find().map(function(doc, index, cursor) {
      let match = true;
      console.log(doc);
      doc.requirements.forEach(function(s) {
        if (!Meteor.user().profile[s] === true) {
          match = false;
        }
      });
      if (match) {
        return doc._id;
      }
    });
    console.log("FUCK");
    console.log(exps);
    return exps;
  }
});
