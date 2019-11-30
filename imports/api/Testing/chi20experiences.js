import {getDetectorId} from "./testingconstants";
import { CONSTANTS } from "./testingconstants";
import {Submissions} from "../OCEManager/currentNeeds";
import {notify} from "../OpportunisticCoordinator/server/noticationMethods";
import {Meteor} from "meteor/meteor";
import {addContribution} from "../OCEManager/OCEs/methods";

let DETECTORS = CONSTANTS.DETECTORS;

// current model
// 0. to create a new experience, we write a fully defined CE API spec as as static definition
// 1. on file load, the detectors and experiences JSON are created [by accessing the current static definition of DETECTORS or the existing Detectors database]
// 2. on updateOCE, we simply access this static definition and make the database reflect this static definition

// current obstacle with current model
// 0. across different branches, it's hard to manage all the experiences we are creating
// updateOCE finds on experience name, but the experiences for different groups are named the same

// findings with using current model
// 0. all the linking logic happens at static definition time, in one file
// 0a. this means we need to make sure on file load, all the links are sorted out

// what if we used factory method pattern? to create objects not on file load, but based on runtime calls
// 0. this is less of a "fixtures" model, but rather building blocks that can be used at run time
// 1. there could be factory methods for creation/updating of OCEs
// 2. definitions for different studies or deployments are activated through runtime e.g., meteor method calls
// 3. that would allow deployments to differ not based on code, but purely on the database?



let CHI20_Olin_EXPERIENCES =  {
  halfhalf_sunny_knowsOlin: {
    _id: Random.id(),
    name: 'Hand Silhouette',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Hand Silhouette 1',
      situation: {
        detector: getDetectorId(DETECTORS.sunny),
        number: '1'
      },
      toPass: {
        instruction: 'Is the <span style="color: #0351ff">weather clear and sunny</span> where you are? Take a photo, <span style="color: #0351ff">holding your hand towards the sky, covering the sun.</span>',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-hands-in-front.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 1,
    }]),
    description: 'Use the sun to make a silhouette of your hand',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A hand silhouette was completed','View the photo').toString()
    }]
  },
  halfhalf_grocery_knowsOlin: {
    _id: Random.id(),
    name: 'Grocery Buddies',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Grocery Buddies 1',
      notificationSubject: 'Inside a grocery store?',
      notificationText: 'Share an experience with others who are also grocery shopping',
      situation: {
        detector: getDetectorId(DETECTORS.grocery),
        number: '1'
      },
      toPass: {
        instruction: 'Are you at the <span style="color: #0351ff">grocery store</span>? Take a photo, <span style="color: #0351ff">holding a fruit or vegetable</span> outstretched with your hands.',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-fruit-in-hand.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 90,
    }]),
    description: 'While shopping for groceries, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A Grocery Buddies photo completed','View the photo').toString()
    }]
  },
  halfhalf_bar_knowsOlin: {
    _id: Random.id(),
    name: 'Cheers',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Cheers 1',
      notificationSubject: 'Drinking at a bar?',
      notificationText: 'Share an experience with others who are also drinking at a bar',
      situation: {
        detector: getDetectorId(DETECTORS.bar),
        number: '1'
      },
      toPass: {
        instruction: 'What are you <span style="color: #0351ff">drinking at the bar</span>? Take a photo, while <span style="color: #0351ff">raising your glass or bottle</span> in front of you.',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-cheers.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 90
    }]),
    description: 'While enjoying your drink, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A Cheers photo completed','View the photo').toString()
    }]
  },
  halfhalf_religious_knowsOlin: {
    _id: Random.id(),
    name: 'Religious Architecture',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Religious Architecture 1',
      notificationSubject: 'Visiting a place of worship?',
      notificationText: 'Share an experience with others who are also visiting a place of worship',
      situation: {
        detector: getDetectorId(DETECTORS.castle),
        number: '1'
      },
      toPass: {
        instruction: 'Do you notice the <span style="color: #0351ff">details of the religious building</span> near you? Do so now, by outstretching your hand and pointing out of the elements that stick out to you most.',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-religious-building.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 90,
    }]),
    description: 'While visiting a place of worship, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A Religious Architecture photo completed','View the photo').toString()
    }]
  },
  halfhalf_sunset_knowsOlin: {
    _id: Random.id(),
    name: 'Sunset Together',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Sunset Together 1',
      notificationSubject: 'Can you see the sunset?',
      notificationText: 'Share an experience with others who are also watching the sunset',
      situation: {
        detector: getDetectorId(DETECTORS.sunset),
        number: '1'
      },
      toPass: {
        instruction: 'What does the <span style="color: #0351ff">sunset</span> look like where you are? Find a good view; then, take a photo, with your hands outstretched towards the sun.',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-sunset-heart.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 1,
    }]),
    description: 'While looking up at the sunset, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A Sunset Together photo completed','View the photo').toString()
    }]
  },
  halfhalf_asian_knowsOlin: {
    _id: Random.id(),
    name: 'Eating with Chopsticks',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Eating with Chopsticks 1',
      notificationSubject: 'Eating at an asian restaurant?',
      notificationText: 'Share an experience with others who are also eating asian food',
      situation: {
        detector: getDetectorId(DETECTORS.eating_with_chopsticks),
        number: '1'
      },
      toPass: {
        instruction: 'Are you eating <span style="color: #0351ff">asian food</span> right now? Take a photo of what you are eating, <span style="color: #0351ff">holding your chopsticks.</span>',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-holding-chopsticks.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 90
    }]),
    description: 'While eating asian food, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('An Eating with Chopsticks photo completed','View the photo').toString()
    }]
  },
  halfhalf_books_knowsOlin: {
    _id: Random.id(),
    name: 'Book Buddies',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Book Buddies 1',
      notificationSubject: 'Are you at a library?',
      notificationText: 'Share an experience with others who are also at the library',
      situation: {
        detector: getDetectorId(DETECTORS.library),
        number: '1'
      },
      toPass: {
        instruction: 'Sorry to interrupt your <span style="color: #0351ff">reading</span>! Find the nearest book, and take a photo <span style="color: #0351ff">holding up the book to your face.</span>',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-book-face.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 90,
    }]),
    description: 'While reading a book, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A Book Buddies photo completed','View the photo').toString()
    }]
  },
  halfhalf_leakmask_knowsOlin: {
    _id: Random.id(),
    name: 'Leaf Mask',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Leaf Mask 1',
      notificationSubject: 'Are you at a park?',
      notificationText: 'Share an experience with others who are also at a park',
      situation: {
        detector: getDetectorId(DETECTORS.forest),
        number: '1'
      },
      toPass: {
        instruction: 'Find a <span style="color: #0351ff">leaf in the park</span>. Take a photo of the <span style="color: #0351ff">leaf covering your face, like it was a mask.</span>',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-leaf-face.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 90
    }]),
    description: 'While in the park, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A Feet to the trees photo completed','View the photo').toString()
    }]
  },
  halfhalf_puddles_knowsOlin: {
    _id: Random.id(),
    name: 'Puddle Feet',
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Puddle Feet 1',
      notificationSubject: 'Are you outside while its raining?',
      notificationText: 'Share an experience with others who are enjoying or enduring the rain',
      situation: {
        detector: getDetectorId(DETECTORS.rainy),
        number: '1'
      },
      toPass: {
        instruction: 'Is it <span style="color: #0351ff">raining</span> today? Find a <span style="color: #0351ff">puddle</span> on the ground. Take a photo of yourself, stomping on the puddle!',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-puddle-feet.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 1,
    }]),
    description: 'With the puddles on a rainy day, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A "Puddle Feet" photo completed','View the photo').toString()
    }]
  },
  halfhalf_coffeesideoflaughs_knowsOlin: {
    _id: Random.id(),
    name: "Coffee with a side of Laughs",
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: "Coffee with a side of Laughs 1",
      notificationSubject: 'Inside a coffee shop?',
      notificationText: 'Share an experience with others who are also at a coffee shop',
      situation: {
        detector: getDetectorId(DETECTORS.coffee), // any place that has cups (cafes + bars + restaurants)
        number: '1'
      },
      toPass: {
        instruction: `Do you have <span style="color: #0351ff">a cup or glass</span> you are drinking? Take a photo with it in the middle of the picture. You can even try to <span style="color: #0351ff">pour some extra "cream"</span> into it too!`,
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-teasing-lotion-in-a-cup.jpg'
      },
      numberNeeded: 2,
      notificationDelay: 90,
    }]),
    description: 'While drinking coffee at a cafe, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify("A 'Coffee with a side of Laughs' photo completed",'View the photo').toString()
    }]
  },
  halfhalf_bigbites_knowsOlin: {
    _id: Random.id(),
    name: "Big Bites",
    group: 'Olin',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsOlin', [{
      needName: "Big Bites 1", // Any restaurant that would serve something you'd eat with your hands (burrito, tacos, hotdogs, sandwiches, wraps, burgers, tradamerican, newamerican )
      notificationSubject: 'Eating at a restaurant?',
      notificationText: 'Share an experience with others who are enjoying big bites of their meal',
      situation: {
        detector: getDetectorId(DETECTORS.big_bite_restaurant),
        number: '1'
      },
      toPass: {
        instruction: `Are you <span style="color: #0351ff">eating food that would require a big bite</span> right now? Take a photo of yourself <span style="color: #0351ff">holding up your food</span> to the middle of the screen.`,
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-big-bite.jpg'
      },
      numberNeeded: 2,
      numberAllowedToParticipateAtSameTime: 1,
      notificationDelay: 90, // https://www.quora.com/Whats-the-average-time-that-customers-wait-between-entering-a-restaurant-and-getting-served
    }]),
    description: 'While eating some non-trivially sized food, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify("A 'Big Bites' photo completed",'View the photo').toString()
    }]
  },
};
