import { Meteor } from "meteor/meteor";

import { Submissions } from "../OCEManager/currentNeeds";

import { addContribution } from '../OCEManager/OCEs/methods';
import {Detectors} from "../UserMonitor/detectors/detectors";
import {notify} from "../OpportunisticCoordinator/server/noticationMethods";

let LOCATIONS = {
  'park': {
    lat: 42.056838,
    lng: -87.675940
  },
  'lakefill': {
    lat: 42.054902,
    lng: -87.670197
  },
  'burgers': {
    lat: 42.046131,
    lng: -87.681559
  },
  'grocery': {
    lat: 42.047621,
    lng: -87.679488
  }
};

let USERS = {
  garrett: {
    username: 'garrett',
    password: 'password',
  },
  garretts_brother: {
    username: 'garretts_brother',
    password: 'password',
  },
  meg: {
    username: 'meg',
    password: 'password',
  },
  megs_sister: {
    username: 'megs_sister',
    password: 'password',
  },
  andrew: {
    username: 'andrew',
    password: 'password',
  },
  josh: {
    username: 'josh',
    password: 'password',
  }
};

let DETECTORS = {
  field: {
    _id: 'XeepEbMjjW8yPzSAo',
    description: 'fields',
    variables: ['var stadiumsarenas;',
      'var baseballfields;',
      'var parks;',
      'var playgrounds;'
    ],
    rules: ['stadiumsarenas || ((parks || playgrounds) || baseballfields);']
  },
  niceish_day: {
    _id: 'x7EgLErQx3qmiemqt',
    description: 'niceish_day',
    variables: ['var clouds;', 'var clear;', 'var daytime;'],
    rules: ['daytime && (clouds || clear);']
  },
  night: {
    _id: 'Wth3TB9Lcf6me6vgy',
    description: 'places where it\'s nighttime,',
    variables: ['var nighttime;'],
    rules: ['(nighttime);']
  },
  sunset: {
    _id: '44EXNzHS7oD2rbF68',
    description: 'places where it\'s sunset,',
    variables: ['var sunset;', 'var clear;'],
    rules: ['sunset && clear;']
  },
  daytime: {
    _id: 'tyZMZvPKkkSPR4FpG',
    description: 'places where it\'s daytime,',
    variables: ['var daytime;'],
    rules: ['daytime;']
  },
  library: {
    _id: '5LqfPRajiQRe9BwBT',
    description: 'libraries and other books',
    variables: [
      'var libraries;',
      'var usedbooks;',
      'var bookstores;'
    ],
    rules: ['(libraries || bookstores);']
  },
  gym: {
    _id: '3XqHN8A4EpCZRpegS',
    description: ' gym',
    variables: ['var  gyms;'],
    rules: [' gyms;']
  },
  produce: {
    _id: 'xDtnmQW3PBMuqq9pW',
    description: 'places to find fruits and veggies',
    variables: ['var communitygardens;',
      'var intlgrocery;',
      'var ethicgrocery;',
      'var markets;',
      'var grocery;',
      'var farmersmarket;',
      'var organic_stores;'
    ],
    rules: ['communitygardens || ((intlgrocery || ethicgrocery) || ((markets || grocery) || (farmersmarket || organic_stores)));']
  },
  rainbow: {
    _id: 'ksxGTXMaSpCFdmqqN',
    description: 'rainbow flag',
    variables: ['var gaybars;'],
    rules: ['gaybars;']
  },
  drugstore: {
    _id: 'k8KFfv3ATtbg2tnFB',
    description: 'drugstores',
    variables: ['var drugstores;', 'var pharmacy;'],
    rules: ['(drugstores || pharmacy);']
  },
  costume_store: {
    _id: 'ECPk2mjuHJtrMotGg',
    description: 'costume_store',
    variables: ['var costumes;', 'var partysupplies;'],
    rules: ['(partysupplies || costumes);']
  },
  irish: {
    _id: '5CJGGtjqyY89n55XP',
    description: 'irish',
    variables: ['var irish_pubs;', 'var irish;'],
    rules: ['(irish_pubs || irish);']
  },
  hair_salon: {
    _id: 'S8oZZwAWpFo5qGq87',
    description: 'hairsalon',
    variables: ['var menshair;',
      'var hairstylists;',
      'var hair_extensions;',
      'var blowoutservices;',
      'var hair;',
      'var barbers;'
    ],
    rules: ['menshair || ((hairstylists || hair_extensions) || ((hair || barbers) || blowoutservices));']
  },
  gas_station: {
    _id: 'CctuBr3GtSXPkzNDQ',
    description: 'gas station',
    variables: ['var servicestations;'],
    rules: ['servicestations;']
  },
  coffee: {
    _id: 'saxQsfSaBiHHoSEYK',
    description: 'coffee',
    variables: ['var coffeeroasteries;',
      'var coffee;',
      'var cafes;',
      'var coffeeshops;',
      'var coffeeteasupplies;'
    ],
    rules: ['(coffeeroasteries || coffee) || ((coffeeshops || coffeeteasupplies) || cafes);']
  },
  bank: {
    _id: 'qR9s4EtPngjZeEp9u',
    description: 'banks',
    variables: ['var banks;'],
    rules: ['banks;']
  },
  beer: {
    _id: 'zrban5i9M6adgwMaK',
    description: 'beer',
    variables: ['var beergardens;',
      'var beertours;',
      'var sportsbars;',
      'var bars;',
      'var irish_pubs;',
      'var breweries;',
      'var divebars;',
      'var beerbar;',
      'var beergarden;',
      'var pubs;',
      'var beer_and_wine;'
    ],
    rules: ['(beergardens || beertours) || ((sportsbars || bars) || ((irish_pubs || breweries) || ((divebars || beerbar) || ((pubs || beer_and_wine) || beergarden))));']
  },
  train: {
    _id: '2wH5bFr77ceho5BgF',
    description: 'trains',
    variables: ['var publictransport;', 'var trainstations;', 'var trains;'],
    rules: ['(trainstations || trains) || publictransport;']
  },
  forest: {
    _id: 'dhQf4PLNAGLy8QDJe',
    description: 'forests',
    variables: ['var campgrounds;',
      'var parks;',
      'var zoos;',
      'var hiking;',
      'var gardens;'
    ],
    rules: ['(campgrounds || parks) || ((hiking || gardens) || zoos);']
  },
  dinning_hall: {
    _id: 'sSK7rbbC9sHQBN94Y',
    description: 'dinninghalls',
    variables: ['var diners;',
      'var restaurants;',
      'var cafeteria;',
      'var food_court;'
    ],
    rules: ['(diners || restaurants || cafeteria || food_court);']
  },
  castle: {
    _id: 'gDcxZQ49QrwxzY7Ye',
    description: 'castles',
    variables: ['var mini_golf;',
      'var buddhist_temples;',
      'var religiousschools;',
      'var synagogues;',
      'var hindu_temples;',
      'var weddingchappels;',
      'var churches;',
      'var mosques;'
    ],
    rules: ['((mini_golf || ((buddhist_temples || religiousschools) || ((synagogues || hindu_temples) || (weddingchappels || churches)))) || mosques);']
  },
  bar: {
    _id: '6urWtr6Tasohdb43u',
    description: 'bars',
    variables: ['var beergardens;',
      'var beertours;',
      'var champagne_bars;',
      'var cocktailbars;',
      'var sportsbars;',
      'var bars;',
      'var barcrawl;',
      'var pianobars;',
      'var brasseries;',
      'var irish_pubs;',
      'var tikibars;',
      'var nightlife;',
      'var breweries;',
      'var divebars;',
      'var poolhalls;',
      'var island_pub;',
      'var beerbar;',
      'var speakeasies;',
      'var irish;',
      'var pubs;',
      'var beer_and_wine;',
      'var distilleries;',
      'var beergarden;',
      'var clubcrawl;',
      'var gaybars;',
      'var whiskeybars;'
    ],
    rules: ['((champagne_bars || cocktailbars) || ((barcrawl || pianobars) || ((tikibars || nightlife) || ((poolhalls || island_pub) || ((speakeasies || irish) || ((clubcrawl || pubs) || (gaybars || whiskeybars))))))) || ((beergardens || beertours) || ((sportsbars || bars) || ((brasseries || irish_pubs) || ((breweries || divebars) || ((poolhalls || beerbar) || ((pubs || beer_and_wine) || (distilleries || beergarden)))))));']
  },
  grocery: {
    _id: 'N5H9w632dbyhqHEsi',
    description: 'grocery shopping',
    variables: ['var intlgrocery;',
      'var ethicgrocery;',
      'var markets;',
      'var wholesalers;',
      'var pharmacy;',
      'var grocery;',
      'var farmersmarket;',
      'var convenience;',
      'var importedfood;',
      'var herbsandspices;',
      'var drugstores;',
      'var seafoodmarkets;',
      'var marketstalls;',
      'var organic_stores;',
      'var publicmarkets;'
    ],
    rules: ['(intlgrocery || ethicgrocery) || ((markets || wholesalers) || ((pharmacy || grocery) || ((farmersmarket || convenience) || ((importedfood || herbsandspices) || ((drugstores || seafoodmarkets) || ((organic_stores || publicmarkets) || marketstalls))))));']
  },
  lake: {
    _id: '9iEpW4mb4ysHY5thP',
    description: 'lake',
    variables: ['var lakes;'],
    rules: ['(lakes);']
  },
  rainy: {
    _id: 'puLHKiGkLCJWpKc62',
    description: 'rainy',
    variables: ['var rain;'],
    rules: ['(rain);']
  },
  sunny: {
    _id: '6vyrBtdDAyRArMasj',
    description: 'clear',
    variables: ['var clear;', 'var daytime;'],
    rules: ['(clear && daytime);']
  },
  cloudy: {
    _id: 'sorCvK53fyi5orAmj',
    description: 'clouds',
    variables: ['var clouds;', 'var daytime;'],
    rules: ['(clouds && daytime);']
  },
  restaurant: {
    _id: 'tR4e2c7PPjWACwX87',
    description: 'eating restaurant',
    variables: ['var italian;',
      'var generic_restaurant;',
      'var lunch_places;',
      'var asian_places;',
      'var pastashops;',
      'var pizza;',
      'var spanish;',
      'var newcanadian;',
      'var scottish;',
      'var greek;',
      'var taiwanese;',
      'var hkcafe;',
      'var sandwiches;',
      'var delis;',
      'var dimsum;',
      'var shanghainese;',
      'var dominican;',
      'var burmese;',
      'var indonesian;',
      'var restaurants;',
      'var uzbek;',
      'var cambodian;',
      'var vegan;',
      'var indpak;',
      'var food_court;',
      'var delicatessen;',
      'var cheesesteaks;',
      'var himalayan;',
      'var thai;',
      'var buffets;',
      'var cantonese;',
      'var catering;',
      'var tuscan;',
      'var hotdog;',
      'var salad;',
      'var hungarian;',
      'var persian;',
      'var hotel_bar;',
      'var mediterranean;',
      'var asianfusion;',
      'var malaysian;',
      'var kosher;',
      'var modern_european;',
      'var gluten_free;',
      'var singaporean;',
      'var chinese;',
      'var szechuan;',
      'var panasian;',
      'var steak;',
      'var seafood;',
      'var pakistani;',
      'var vegetarian;',
      'var tapasmallplates;',
      'var african;',
      'var soup;',
      'var halal;',
      'var basque;',
      'var french;',
      'var bangladeshi;',
      'var wraps;',
      'var japacurry;',
      'var cafes;',
      'var hakka;'
    ],
    rules: ['italian = (pastashops || pizza) || ((sandwiches || delis) || ((italian || restaurants) || ((delicatessen || cheesesteaks) || ((catering || tuscan) || (hotdog || salad)))));',
      'generic_restaurant = (spanish || newcanadian) || ((dimsum || shanghainese) || ((uzbek || cambodian) || ((himalayan || italian) || ((hungarian || persian) || ((kosher || modern_european) || ((steak || seafood) || ((tapasmallplates || african) || ((basque || chinese) || (french || bangladeshi)))))))));',
      'lunch_places = (scottish || greek) || ((dominican || sandwiches) || ((vegan || indpak) || ((thai || delis) || ((hotel_bar || mediterranean) || ((gluten_free || buffets) || ((pakistani || vegetarian) || ((soup || halal) || ((delicatessen || wraps) || ((japacurry || catering) || ((cafes || hakka) || salad))))))))));',
      'asian_places = (taiwanese || hkcafe) || ((burmese || indonesian) || ((dimsum || food_court) || ((buffets || cantonese) || ((asianfusion || malaysian) || ((singaporean || chinese) || (szechuan || panasian))))));',
      '(italian || generic_restaurant) || (asian_places || lunch_places);'
    ]
  },
  exercising: {
    _id: '6eY5Z5vrfHcNrefM6',
    description: 'exercising',
    variables: ['var boxing;',
      'var kickboxing;',
      'var amateursportsteams;',
      'var religiousschools;',
      'var muaythai;',
      'var gyms;',
      'var physicaltherapy;',
      'var fencing;',
      'var tennis;',
      'var healthtrainers;',
      'var poledancingclasses;',
      'var badminton;',
      'var beachvolleyball;',
      'var football;',
      'var bootcamps;',
      'var pilates;',
      'var dancestudio;',
      'var brazilianjiujitsu;',
      'var trampoline;',
      'var cyclingclasses;',
      'var cardioclasses;',
      'var barreclasses;',
      'var intervaltraininggyms;',
      'var sports_clubs;',
      'var weightlosscenters;',
      'var active;',
      'var aerialfitness;',
      'var communitycenters;',
      'var yoga;',
      'var squash;',
      'var surfing;',
      'var circuittraininggyms;',
      'var fitness;',
      'var martialarts;'
    ],
    rules: ['(((amateursportsteams || religiousschools) || ((physicaltherapy || fencing) || ((beachvolleyball || football) || tennis))) || ((boxing || kickboxing) || ((muaythai || gyms) || ((badminton || healthtrainers) || ((bootcamps || pilates) || ((trampoline || dancestudio) || ((cyclingclasses || cardioclasses) || ((barreclasses || sports_clubs) || ((active || weightlosscenters) || ((yoga || aerialfitness) || ((surfing || fitness) || (martialarts || circuittraininggyms)))))))))))) || ((boxing || kickboxing) || ((muaythai || gyms) || ((healthtrainers || poledancingclasses) || ((bootcamps || pilates) || ((dancestudio || brazilianjiujitsu) || ((cyclingclasses || cardioclasses) || ((barreclasses || intervaltraininggyms) || ((sports_clubs || weightlosscenters) || ((aerialfitness || communitycenters) || ((squash || surfing) || ((fitness || martialarts) || circuittraininggyms)))))))))));']
  },
  eating_japanese: {
    _id: "vpP7boQqvLzxhDxjg",
    description: "eating a japanese meal",
    variables: [
      "var sushi;",
      "var japanese;",
      "var tonkatsu;",
      "var teppanyaki;",
      "var tempura;",
      "var ramen;",
      "var izakaya;",
      "var udon;"
    ],
    rules: ["(sushi || japanese) || ((tonkatsu || teppanyaki) || ((tempura || ramen) || (izakaya || udon)));"]
  },
  eating_with_chopsticks: {
    _id: "5Ay2Ys9DAH2PcPS4a",
    description: "eating with chopsticks",
    variables: [
      "var korean;",
      "var hawaiian;",
      "var japacurry;",
      "var sushi;",
      "var singaporean;",
      "var hakka;",
      "var laotian;",
      "var cambodian;",
      "var japanese;",
      "var tonkatsu;",
      "var chinese;",
      "var taiwanese;",
      "var vietnamese;",
      "var indonesian;",
      "var panasian;",
      "var thai;",
      "var noodles;",
      "var hotpot;",
      "var tcm;",
      "var cantonese;",
      "var asianfusion;",
      "var dimsum;",
      "var shanghainese;",
      "var burmese;",
      "var teppanyaki;",
      "var tempura;",
      "var szechuan;",
      "var hkcafe;",
      "var ramen;",
      "var izakaya;",
      "var malaysian;",
      "var udon;"
    ],
    rules: [
      "(((japacurry || sushi) || ((japanese || tonkatsu) || ((noodles || hotpot) || ((asianfusion || korean) || ((teppanyaki || tempura) || ((ramen || izakaya) || (malaysian || udon))))))) || (korean || hawaiian)) || (((singaporean || hakka) || ((chinese || taiwanese) || ((tcm || cantonese) || ((dimsum || shanghainese) || ((szechuan || hkcafe) || burmese))))) || ((laotian || cambodian) || ((vietnamese || indonesian) || (panasian || thai))));"
    ]
  },
  hour0: {
    _id: "v2ANTJr1I7wle3Ek8",
    description: "during 00:00",
    variables: ["var hour;"],
    rules: ["hour == 0"]
  },
  hour1: {
    _id: "kDIB1oQOnKktS1j4Z",
    description: "during 01:00",
    variables: ["var hour;"],
    rules: ["hour == 1"]
  },
  hour2: {
    _id: "ZId1ezjZGAkfbpcWB",
    description: "during 02:00",
    variables: ["var hour;"],
    rules: ["hour == 2"]
  },
  hour3: {
    _id: "qZRVcySQpf2g6xcfA",
    description: "during 03:00",
    variables: ["var hour;"],
    rules: ["hour == 3"]
  },
  hour4: {
    _id: "3JSnJAmYQzJFgqJpD",
    description: "during 04:00",
    variables: ["var hour;"],
    rules: ["hour == 4"]
  },
  hour5: {
    _id: "iosGAkRVqT0zYlHmA",
    description: "during 05:00",
    variables: ["var hour;"],
    rules: ["hour == 5"]
  },
  hour6: {
    _id: "RxDnq3KRXKQjLHymw",
    description: "during 06:00",
    variables: ["var hour;"],
    rules: ["hour == 6"]
  },
  hour7: {
    _id: "rnQQ9xRK4LyqPNSnN",
    description: "during 07:00",
    variables: ["var hour;"],
    rules: ["hour == 7"]
  },
  hour8: {
    _id: "WRaFXtU7Igw6mjpzd",
    description: "during 08:00",
    variables: ["var hour;"],
    rules: ["hour == 8"]
  },
  hour9: {
    _id: "7IlqQnNFaAoJmDLy6",
    description: "during 09:00",
    variables: ["var hour;"],
    rules: ["hour == 9"]
  },
  hour10: {
    _id: "K5Y0rpCXcxAdPIkBA",
    description: "during 10:00",
    variables: ["var hour;"],
    rules: ["hour == 10"]
  },
  hour11: {
    _id: "a5DzoZ3nb6fKQDaRn",
    description: "during 11:00",
    variables: ["var hour;"],
    rules: ["hour == 11"]
  },
  hour12: {
    _id: "htseIlmY5c7Q9Ihnh",
    description: "during 12:00",
    variables: ["var hour;"],
    rules: ["hour == 12"]
  },
  hour13: {
    _id: "t5CT9YiIQvsZufVq8",
    description: "during 13:00",
    variables: ["var hour;"],
    rules: ["hour == 13"]
  },
  hour14: {
    _id: "zepMCtTEOlELnXOM3",
    description: "during 14:00",
    variables: ["var hour;"],
    rules: ["hour == 14"]
  },
  hour15: {
    _id: "aHwbbglrhLeQqDYK6",
    description: "during 15:00",
    variables: ["var hour;"],
    rules: ["hour == 15"]
  },
  hour16: {
    _id: "tcftEov84sDlZHx1B",
    description: "during 16:00",
    variables: ["var hour;"],
    rules: ["hour == 16"]
  },
  hour17: {
    _id: "53puB2TSVHxsHtbZ2",
    description: "during 17:00",
    variables: ["var hour;"],
    rules: ["hour == 17"]
  },
  hour18: {
    _id: "Jdz8DFUyC37jqROOq",
    description: "during 18:00",
    variables: ["var hour;"],
    rules: ["hour == 18"]
  },
  hour19: {
    _id: "tV0Jt9xgGkME1MBla",
    description: "during 19:00",
    variables: ["var hour;"],
    rules: ["hour == 19"]
  },
  hour20: {
    _id: "LtUoOKZMm0ovNnsmX",
    description: "during 20:00",
    variables: ["var hour;"],
    rules: ["hour == 20"]
  },
  hour21: {
    _id: "X9YChduJTWV9UXVez",
    description: "during 21:00",
    variables: ["var hour;"],
    rules: ["hour == 21"]
  },
  hour22: {
    _id: "NFNWR5VMUse3B8j0B",
    description: "during 22:00",
    variables: ["var hour;"],
    rules: ["hour == 22"]
  },
  hour23: {
    _id: "NvegeW31LiB8Zm77M",
    description: "during 23:00",
    variables: ["var hour;"],
    rules: ["hour == 23"]
  },
};

function createStorytime() {
  let storytimeCallback = function (sub) {
    Meteor.users.update({
      _id: sub.uid
    }, {
      $set: {
        'profile.staticAffordances.participatedInStorytime': true
      }
    });

    // set affordances for storytime
    let affordance = sub.content.affordance;

    // configure specific detectors
    let options = [
      ['Drinking butterbeer', CONSTANTS.DETECTORS.beer_storytime._id],
      ['Hogwarts Express at Platform 9 3/4', CONSTANTS.DETECTORS.train_storytime._id],
      ['Forbidden Forest', CONSTANTS.DETECTORS.forest_storytime._id],
      ['Dinner at the Great Hall', CONSTANTS.DETECTORS.dinning_hall_storytime._id],
      ['Hogwarts Castle', CONSTANTS.DETECTORS.castle_storytime._id],
      ['Quidditch Pitch', CONSTANTS.DETECTORS.field_storytime._id],
      ['Training in the Room of Requirement ', CONSTANTS.DETECTORS.gym_storytime._id]
    ];
    options = options.filter(function (x) {
      return x[1] !== affordance;
    });

    // add need if not all pages are done
    let needName = 'page' + Random.id(3);
    if (cb.numberOfSubmissions() === 7) {
      needName = 'pageFinal'
    }

    // create and add contribution
    let contribution = {
      needName: needName,
      situation: {
        detector: affordance,
        number: '1'
      },
      toPass: {
        instruction: sub.content.sentence,
        dropdownChoices: {
          name: 'affordance',
          options: options
        }
      },
      numberNeeded: 1,
      notificationDelay: 10 // 10 seconds for debugging
    };

    addContribution(sub.iid, contribution);
  };

  // setup places and detectors for storytime
  let places = ["beer", "train", "forest", "dinning_hall", "castle", "field", "gym"];
  let detectorIds = [
    "N3uajhH3chDssFq3r", "Ly9vMvepymC4QNJqA", "52j9BfZ8DkZvSvhhf", "AKxSxuYBFqKP3auie",
    "LTnK6z94KQTJKTmZ8", "cDFgLqAAhtFWdmXkd", "H5P9ga8HHpCbxBza8", "M5SpmZQdc82GJ7xDj"
  ];

  let i = 0;
  _.forEach(places, (place) => {
    let newVars = JSON.parse(JSON.stringify(DETECTORS[place]['variables']));
    newVars.push('var participatedInStorytime;');

    DETECTORS[place + "_storytime"] = {
      '_id': detectorIds[i],
      'description': DETECTORS[place].description + "_storytime",
      'variables': newVars,
      // 'rules': ['(' + DETECTORS[place].rules[0] + ' ) && !participatedInStorytime;']
      'rules': [`!participatedInStorytime && ${DETECTORS[place].rules[0]}`]
    };

    i++;
  });

  let dropdownOptions = [
    ['Drinking butterbeer', DETECTORS.beer_storytime._id],
    ['Hogwarts Express at Platform 9 3/4', DETECTORS.train_storytime._id],
    ['Forbidden Forest', DETECTORS.forest_storytime._id],
    ['Dinner at the Great Hall', DETECTORS.dinning_hall_storytime._id],
    ['Hogwarts Castle', DETECTORS.castle_storytime._id],
    ['Quidditch Pitch', DETECTORS.field_storytime._id],
    ['Training in the Room of Requirement ', DETECTORS.gym_storytime._id]
  ];

  // create story starting point
  let firstSentence = 'Harry Potter looked up at the clouds swirling above him.';
  // notify users when story is complete
  let sendNotification = function (sub) {
    let uids = Submissions.find({iid: sub.iid}).fetch().map(function (x) {
      return x.uid;
    });

    notify(uids, sub.iid, 'Our story is finally complete. Click here to read it!',
      '', '/apicustomresults/' + sub.iid + '/' + sub.eid);
  };

  // create and return storytime experience
  return {
    _id: "wGWTtQjmgEYSuRtrk", //Random.id(),
    name: 'Storytime',
    participateTemplate: 'storyPage',
    resultsTemplate: 'storybook',
    contributionTypes: [{
      needName: 'pageOne',
      situation: {
        detector: DETECTORS.niceish_day._id,
        number: '1'
      },
      toPass: {
        instruction: firstSentence,
        firstSentence: firstSentence,
        dropdownChoices: {
          name: 'affordance',
          options: dropdownOptions
        }
      },
      numberNeeded: 1,
      notificationDelay: 10 // 10 seconds for debugging
    }],
    description: 'We\'re writing a Harry Potter spin-off story',
    notificationText: 'Help write a Harry Potter spin-off story!',
    callbacks: [
      {
        trigger: 'cb.newSubmission() && (cb.numberOfSubmissions() <= 7)',
        function: storytimeCallback.toString(),
      },
      {
        trigger: 'cb.incidentFinished()',
        function: sendNotification.toString()
      }]
  };
}


function createBumped() {
  let experience = {
    name: 'Bumped',
    participateTemplate: 'bumped',
    resultsTemplate: 'bumpedResults',
    contributionTypes: [],
    description: 'You just virtually bumped into someone!',
    notificationText: 'You just virtually bumped into someone!',
    callbacks: []
  };

  let bumpedCallback = function (sub) {
    console.log("calling the bumped callback!!!");

    let otherSub = Submissions.findOne({
      uid: {
        $ne: sub.uid
      },
      iid: sub.iid,
      needName: sub.needName
    });

    notify([sub.uid, otherSub.uid], sub.iid, 'See a photo from who you virtually bumped into!', '', '/apicustomresults/' + sub.iid + '/' + sub.eid);
  };

  let relationships = ['lovesDTR', 'lovesGarrett', 'lovesMeg', 'lovesMaxine'];
  let places = [
    ["bar", "at a bar"],  // like Cheers!
    ["coffee", "at a coffee shop"],
    ["grocery", "at a grocery store"],
    ["restaurant", "at a restaurant"],
    ["train", "commuting"],
    ["exercising", "exercising"]
  ];
  _.forEach(relationships, (relationship) => {
    _.forEach(places, (place) => {

      let newVars = JSON.parse(JSON.stringify(DETECTORS[place[0]]['variables']));
      newVars.push('var ' + relationship + ';');

      let newRules = JSON.parse(JSON.stringify(DETECTORS[place[0]]['rules']));
      // modify last detector rule
      // when rules has a flat structure where rules.length == 1, last rule is the predicate
      // i.e. ['(diners || restaurants || cafeteria || food_court);']
      // when rules have a nested structure where rules.length > 1, last rule is the predicate
      // i.e. ['worship_places = (buddhist_temples || churches);', '(worship_places || landmarks);']
      let lastRule = newRules.pop();
      // each rule has a `;` at end, i.e. (rain && park);
      // in order to modify the rule, must add relationship predicate preceding the rule
      lastRule = `${relationship} && ${lastRule}`;
      newRules.push(lastRule);

      let detector = {
        '_id': Random.id(),
        'description': DETECTORS[place[0]].description + relationship,
        'variables': newVars,
        'rules': newRules
      };
      DETECTORS[place[0] + relationship] = detector;

      for (let i = 0; i < 1; i++) {
        let need = {
          needName: place[0] + relationship + i,
          situation: {
            detector: detector._id,
            number: '2'
          },
          toPass: {
            instruction: 'You are at a  ' + place[1] + ' at the same time as '
          },
          numberNeeded: 2,
          notificationDelay: 30 // 30 seconds for debugging
        };

        let callback = {
          trigger: 'cb.numberOfSubmissions(\'' + place[0] + relationship + i + '\') === 2',
          function: bumpedCallback.toString(),
        };

        experience.contributionTypes.push(need);
        experience.callbacks.push(callback)
      }
    })
  });

  return experience;
}

/** createHalfHalf
 *
 * @param numberInSituation [Integer] number of people that need to be in the same situation at the same time
 * @param notificationDelay [Integer] notificationDelay for all places
 * @returns {{name: string, participateTemplate: string, resultsTemplate: string, contributionTypes: Array, description: string, notificationText: string, callbacks: Array}}
 */
const createHalfHalf = function(
  {
    numberInSituation = 1,
    notificationDelay = 120,
  } = {}
) {
  let experience = {
    name: 'Half Half Bumped',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: [],
    description: 'Participate in HalfHalf Travel: Capture your side of the story',
    notificationText: 'Participate in HalfHalf Travel: Capture your side of the story',
    callbacks: []
  };


  let completedCallback = function(sub) {
    console.log("Another pair of halves completed a photo");

    let submissions = Submissions.find({
      iid: sub.iid,
      needName: sub.needName
    }).fetch();

    let participants = submissions.map((submission) => { return submission.uid; });

    notify(participants, sub.iid,
      `Two people completed a half half photo`,
      `See the results under ${sub.needName}`,
      '/apicustomresults/' + sub.iid + '/' + sub.eid);
  };

  let places = [
    ["bar", "at a bar", notificationDelay],
    ["coffee", "at a coffee shop", notificationDelay],
    ["grocery", "at a grocery store", notificationDelay],
    ["restaurant", "at a restaurant", notificationDelay],
    ["train", "commuting", notificationDelay],
    ["exercising", "exercising", notificationDelay]
  ];

  _.forEach(places, (place) => {

    let [detectorName, situationDescription, delay] = place;

    let need = {
      needName: `half half: ${situationDescription}`,
      situation: {
        detector: DETECTORS[detectorName]._id,
        number: numberInSituation
      },
      toPass: {
        instruction: `Having a good time ${situationDescription}? Try taking one side of a photo.`
      },
      numberNeeded: 2,
      notificationDelay: delay
    };

    let callback = {
      trigger: `cb.numberOfSubmissions("${need.needName}") % 2`,
      function: completedCallback.toString(),
    };
    experience.contributionTypes.push(need);
    experience.callbacks.push(callback)
  });

  return experience;
};

const halfhalfEmbodiedContributionTypes = function() {
  return [{
    needName: 'Hand Silhouette',
    situation: {
      detector: DETECTORS.sunny._id,
      number: '1'
    },
    toPass: {
      instruction: 'Take a photo, holding your hand towards the sky, covering the sun.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-hands-in-front.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 1,
  }, {
    needName: 'I eat with my hands',
    situation: {
      detector: DETECTORS.grocery._id,
      number: '1'
    },
    toPass: {
      instruction: 'Take a photo, holding a fruit or vegetable outstretched with your hands.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-holding-orange.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 90,
  }, {
    needName: 'Coffee Date',
    situation: {
      detector: DETECTORS.coffee._id,
      number: '1'
    },
    toPass: {
      instruction: 'Are you at a cafe? Take a photo, holding your cup, mug, or plate towards the center of the screen.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-cafe.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 60 * 4
  }, {
    needName: 'Raise a glass',
    situation: {
      detector: DETECTORS.bar._id,
      number: '1'
    },
    toPass: {
      instruction: 'What are you drinking? Take a photo, while raising your glass or bottle in front of you.',
      // exampleImage: TODO(rlouie): get image holding a glass / bottle, indoors. Maybe towards the lights in the bar
    },
    numberNeeded: 50,
    notificationDelay: 60 * 10
  }, {
    needName: 'Itadakimasu (I humbly receive this meal)',
    situation: {
      detector: DETECTORS.eating_japanese._id,
      number: '1'
    },
    toPass: {
      instruction: 'Take a photo, while holding chopsticks in your hand, saying "Itadakimasu" which translates to "I humbly receive this meal"',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-itadakimasu.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 60 * 10
  }, {
    needName: 'Religious Architecture',
    situation: {
      detector: DETECTORS.castle._id,
      number: '1'
    },
    toPass: {
      instruction: 'Do you notice the details of religious buildings? Do so now, by outstretching your hand and pointing out of the elements that stick out to you most.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-religious-building.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 30
  }, {
    needName: 'Touch a sunset',
    situation: {
      detector: DETECTORS.sunset._id,
      number: '1'
    },
    toPass: {
      instruction: 'What does the sunset look like where you are? Find a good view of the sunset. Then, take a photo, with your hands outstretched towards the sun.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-sunset-heart.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 1,
  }, {
    needName: 'Eating with Chopsticks',
    situation: {
      detector: DETECTORS.eating_with_chopsticks._id,
      number: '1'
    },
    toPass: {
      instruction: 'What can you pick up using chopsticks? Take a photo of what you are eating, holding your chopsticks.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-holding-chopsticks.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 60 * 15
  }, {
    needName: 'Whats in your grocery basket',
    situation: {
      detector: DETECTORS.grocery._id,
      number: '1'
    },
    toPass: {
      instruction: 'What are you planning on eating for the week? Take a photo holding up a favorite or essential item in your shopping basket or cart.',
    },
    numberNeeded: 50,
    notificationDelay: 60 * 5
  }, {
    needName: 'filling up gas',
    situation: {
      detector: DETECTORS.gas_station._id,
      number: '1'
    },
    toPass: {
      instruction: 'You must be filling up at the station! Take a photo of your hand holding the filling pump.'
    },
    numberNeeded: 50,
    notificationDelay: 60 * 2
  }, {
    needName: 'reading a book',
    situation: {
      detector: DETECTORS.library._id,
      number: '1'
    },
    toPass: {
      instruction: 'Sorry to interrupt your reading! Find the nearest book, and take a photo holding up the book to your face.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-book-face.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 60 * 10
  }, {
    needName: 'Hold a flower',
    situation: {
      detector: DETECTORS.forest._id,
      number: '1'
    },
    toPass: {
      instruction: 'Find a flower in the park or garden. Take a photo, with your hand shaped as a half-circle.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-hand-circles-flower.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 15
  }, {
    needName: 'Feet towards the trees',
    situation: {
      detector: DETECTORS.forest._id,
      number: '1'
    },
    toPass: {
      instruction: 'Find a patch of grass to lay your back on. Then, raise your feet. Take a photo of your foot stretching high into the sky',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-feet-towards-trees.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 15
  }, {
    needName: 'Leaf Mask',
    situation: {
      detector: DETECTORS.forest._id,
      number: '1'
    },
    toPass: {
      instruction: 'Find a leaf in the park. Take a photo of the leaf covering your face, like it was a mask.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-leaf-face.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 15
  }];
};

const create24hoursContributionTypes = function(toPassConstructor, numberNeeded) {
  let needs = [];
  for (i = 0; i < 24; i++) {
    let need = {
      needName: `hour ${i}`,
      situation: {
        detector: DETECTORS[`hour${i}`]._id,
        number: 1
      },
      toPass: toPassConstructor(i),
      numberNeeded: numberNeeded,
      notificationDelay: 1
    };
    needs.push(need);
  }
  return needs;
};

const createCallbacksForEmbodiedMimicry = function(contributionTypes) {
  return contributionTypes.map((need) => {
    return {
      trigger: `cb.numberOfSubmissions(${need.needName}) % 2 === 0`,
      function: sendNotificationTwoHalvesCompleted.toString()
    };
  });
};

const sendNotificationNew24HourPhotoAlbumSub = function(sub) {
  let uids = Submissions.find({ iid: sub.iid }).fetch().map(function (x) {
    return x.uid;
  });

  notify(uids, sub.iid, 'Someone added to the 24 hour photo album. Click here to see progress on the album.', '', '/apicustomresults/' + sub.iid + '/' + sub.eid);
};

let sendNotificationScavenger = function (sub) {
  let uids = Submissions.find({ iid: sub.iid }).fetch().map(function (x) {
    return x.uid;
  });

  notify(uids, sub.iid, 'Wooh! All the scavenger hunt items were found. Click here to see all of them.', '', '/apicustomresults/' + sub.iid + '/' + sub.eid);
};

let sendNotificationSunset = function (sub) {
  let uids = Submissions.find({ iid: sub.iid }).fetch().map(function (x) {
    return x.uid;
  });

  notify(uids, sub.iid, 'Our sunset timelapse is complete! Click here to see it.', '', '/apicustomresults/' + sub.iid + '/' + sub.eid);
};

let sendNotificationFoodFight = function (sub) {
  let uids = Submissions.find({ iid: sub.iid }).fetch().map(function (x) {
    return x.uid;
  });
  notify(uids, sub.iid, 'Wooh! Both participants have attacked each other with food pics', '', '/apicustomresults/' + sub.iid + '/' + sub.eid);
};

const sendNotificationTwoHalvesCompleted = function(sub) {
  console.log("Another pair of halves completed a photo");

  let submissions = Submissions.find({
    iid: sub.iid,
    needName: sub.needName
  }).fetch();

  let participants = submissions.map((submission) => { return submission.uid; });

  notify(participants, sub.iid,
    `Two people completed a half half photo`,
    `See the results under ${sub.needName}`,
    '/apicustomresults/' + sub.iid + '/' + sub.eid);
};

let EXPERIENCES = {
  bumped: createBumped(),
  storyTime: createStorytime(),
  sunset: {
    _id: Random.id(),
    name: 'Sunset',
    participateTemplate: 'uploadPhoto',
    resultsTemplate: 'sunset',
    contributionTypes: [{
      needName: 'sunset',
      situation: {
        detector: DETECTORS.sunset._id,
        number: '1'
      },
      toPass: {
        instruction: 'Take a photo of the sunset!'
      },
      numberNeeded: 20,
      notificationDelay: 1,
    }],
    description: 'Create a timelapse of the sunset with others around the country',
    notificationText: 'Take a photo of the sunset!',
    callbacks: [{
      trigger: 'cb.incidentFinished()',
      function: sendNotificationSunset.toString()
    }]
  },
  halfhalf24: {
    _id: Random.id(),
    name: 'Half Half over 24 hours',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults', // FIXME(rlouie): should be a template grouped by time
    contributionTypes: create24hoursContributionTypes(
      function(i) {
        let zpad_i = ("00" + i).slice(-2);
        let toPass = {
          instruction: `<span style="color: #0351ff">This experience is for testing the Half Half Photo Experience!</span><b> Take a picture of what you are doing today at hour ${zpad_i}:00 today.</b>`
        };
        return toPass;
      },
      10
    ),
    description: 'Create a photo collage of what you and others are doing at each of the hours in a day',
    notificationText: 'Take a photo of what you are doing at this hour',
    callbacks: [{
      trigger: 'cb.newSubmission()',
      function: sendNotificationNew24HourPhotoAlbumSub.toString()
    }]
  },
  halfhalfAsynch: createHalfHalf(),
  halfhalfSynch: createHalfHalf({numberInSituation: 2}),
  halfhalfDay: {
    _id: Random.id(),
    name: 'Half Half Daytime',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: [{
      needName: 'half half: daytime', // FIXME: make more semantically meaningful
      situation: {
        detector: DETECTORS.daytime._id,  // For testing during workday
        number: '1'
      },
      toPass: {
        instruction: 'Take a photo of like Half Half Travel!'
      },
      numberNeeded: 50, // arbitrarily high for a study
      notificationDelay: 1,
    }],
    description: 'Create adventures that meet halfway! Ready to live in a parallel with someone else?',
    notificationText: 'Participate in Half Half Travel!',
    callbacks: [{
      trigger: 'cb.numberOfSubmissions("half half: daytime") % 2 === 0',
      function: sendNotificationTwoHalvesCompleted.toString()
    }]
  },
  halfhalfNight: {
    _id: Random.id(),
    name: 'Half Half Nighttime',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: [{
      needName: 'half half: nighttime', // FIXME: make more semantically meaningful
      situation: {
        detector: DETECTORS.night._id,  // For testing during evening
        number: '1'
      },
      toPass: {
        instruction: 'Take a photo of like Half Half Travel!'
      },
      numberNeeded: 50, // arbitrarily high for a study
      notificationDelay: 1, // no need to delay if its daytime outside
    }],
    description: 'Create adventures that meet halfway! Ready to live in a parallel with someone else?',
    notificationText: 'Participate in Half Half Travel!',
    callbacks: [{
      trigger: 'cb.numberOfSubmissions("half half: nighttime") % 2 === 0',
      function: sendNotificationTwoHalvesCompleted.toString()
    }]
  },
  halfhalfEmbodiedMimicry: {
    _id: Random.id(),
    name: 'Body Mirror',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: halfhalfEmbodiedContributionTypes(),
    description: 'With your environment as the shared canvas, pose your body to be the mirror image of a friend',
    notificationText: 'Your situation made you available to participate in Body Mirror!',
    callbacks: createCallbacksForEmbodiedMimicry(halfhalfEmbodiedContributionTypes())
  },
  scavengerHunt: {
    _id: Random.id(),
    name: 'St. Patrick\'s Day Scavenger Hunt',
    participateTemplate: 'scavengerHuntParticipate',
    resultsTemplate: 'scavengerHunt',
    contributionTypes: [{
      needName: 'beer',
      situation: {
        detector: DETECTORS.beer._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of beer?'
      },
      numberNeeded: 1,
      notificationDelay: 30, // 30 seconds for debugging
    }, {
      needName: 'greenProduce',
      situation: {
        detector: DETECTORS.produce._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of green vegetables? #leprechaunfood'
      },
      numberNeeded: 1,
      notificationDelay: 20, // 20 seconds for debugging
    }, {
      needName: 'coins',
      situation: {
        detector: DETECTORS.drugstore._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of chocolate gold coins on display?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }, {
      needName: 'leprechaun',
      situation: {
        detector: DETECTORS.costume_store._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of a Leprechaun costume?'
      },
      numberNeeded: 1,
      notificationDelay: 15, // 15 seconds for debugging
    }, {
      needName: 'irishSign',
      situation: {
        detector: DETECTORS.irish._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of an Irish sign?'
      },
      numberNeeded: 1,
      notificationDelay: 1, // 1 seconds for debugging (passing by)
    }, {
      needName: 'trimmings',
      situation: {
        detector: DETECTORS.hair_salon._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of some Leprechaun beard trimmings?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }, {
      needName: 'liquidGold',
      situation: {
        detector: DETECTORS.gas_station._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of liquid gold that Leprechauns use to power their vehicles?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }, {
      needName: 'potOfGold',
      situation: {
        detector: DETECTORS.bank._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of a bank where Leprechauns hide their pots of gold?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }, {
      needName: 'rainbow',
      situation: {
        detector: DETECTORS.rainbow._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of a rainbow flag?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }],
    description: 'Find an item for a scavenger hunt',
    notificationText: 'Help us complete a St. Patrick\'s day scavenger hunt',
    callbacks: [{
      trigger: 'cb.incidentFinished()',
      function: sendNotificationScavenger.toString()
    }]
  },
  natureHunt: {
    _id: Random.id(),
    name: 'Nature Scavenger Hunt',
    participateTemplate: 'scavengerHuntParticipate',
    resultsTemplate: 'scavengerHunt',
    contributionTypes: [{
      needName: 'tree',
      situation: {
        detector: DETECTORS.forest._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of a tree?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }, {
      needName: 'leaf',
      situation: {
        detector: DETECTORS.forest._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of a leaf?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }, {
      needName: 'grass',
      situation: {
        detector: DETECTORS.field._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of the grass?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }, {
      needName: 'lake',
      situation: {
        detector: DETECTORS.lake._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of the lake?'
      },
      numberNeeded: 1,
      notificationDelay: 10, // 10 seconds for debugging
    }, {
      needName: 'moon',
      situation: {
        detector: DETECTORS.night._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of the moon?'
      },
      numberNeeded: 1,
      notificationDelay: 1, // 1 seconds for debugging
    }, {
      needName: 'sun',
      situation: {
        detector: DETECTORS.sunny._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of the sun?'
      },
      numberNeeded: 1,
      notificationDelay: 1, // 1 seconds for debugging
    }, {
      needName: 'blueSky',
      situation: {
        detector: DETECTORS.sunny._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of the blue sky?'
      },
      numberNeeded: 1,
      notificationDelay: 1, // 1 seconds for debugging
    }, {
      needName: 'clouds',
      situation: {
        detector: DETECTORS.cloudy._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of the clouds?'
      },
      numberNeeded: 1,
      notificationDelay: 1, // 1 seconds for debugging
    }, {
      needName: 'puddle',
      situation: {
        detector: DETECTORS.rainy._id,
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of the puddle?'
      },
      numberNeeded: 1,
      notificationDelay: 1, // 1 seconds for debugging
    }],
    description: 'Find an item for a scavenger hunt',
    notificationText: 'Help us out with our nature scavenger hunt',
    callbacks: [{
      trigger: 'cb.incidentFinished()',
      function: sendNotificationScavenger.toString()
    }]
  },
  foodfight: {
    _id: Random.id(),
    name: "Food Fight!",
    participateTemplate: "scavengerHuntParticipate",
    resultsTemplate: "scavengerHunt",
    contributionTypes: [
      {
        needName: "foodPhoto",
        situation: {
          detector: DETECTORS.restaurant._id,
          number: 1
        },
        toPass: {
          instruction: "Can you take a photo of what you're eating?"
        },
        numberNeeded: 1
      },
      {
        needName: "foodPhoto",
        situation: {
          detector: DETECTORS.restaurant._id,
          number: 1
        },
        toPass: {
          instruction: "Can you take a photo of what you're eating?"
        },
        numberNeeded: 1
      }
    ],
    description: "Food fight!",
    notificationText: "Food fight!",
    callbacks: [{
        trigger: "cb.incidentFinished()",
        function: sendNotificationFoodFight.toString()
    }]
  }
};

export const CONSTANTS = {
  'LOCATIONS': LOCATIONS,
  'USERS': USERS,
  // Comment out if you would like to only test specific experiences
  // 'EXPERIENCES': (({ halfhalfEmbodiedMimicry }) => ({ halfhalfEmbodiedMimicry }))(EXPERIENCES),
  'EXPERIENCES': EXPERIENCES,
  'DETECTORS': DETECTORS
};

// Meteor.call('locations.updateUserLocationAndAffordances', {
//   uid: Accounts.findUserByUsername('b@gmail.com')._id,
//   lat: 42.054902,  //lakefill
//   lng: -87.670197
// });
// Meteor.call('locations.updateUserLocationAndAffordances', {
//   uid: Accounts.findUserByUsername('c@gmail.com')._id,
//   lat: 42.056975, //ford
//   lng:  -87.676575
// });
// Meteor.call('locations.updateUserLocationAndAffordances', {
//   uid: Accounts.findUserByUsername('d@gmail.com')._id,
//   lat: 42.059273, //garage
//   lng: -87.673794
// });
// Meteor.call('locations.updateUserLocationAndAffordances', {
//   uid: Accounts.findUserByUsername('e@gmail.com')._id,
//   lat: 42.044314,  //nevins
//   lng: -87.682157
// });
//
// Meteor.call('locations.updateUserLocationAndAffordances', {
//   uid: Accounts.findUserByUsername('g@gmail.com')._id,
//   lat: 42.044314,  //nevins
//   lng: -87.682157
// });
// Meteor.call('locations.updateUserLocationAndAffordances', {
//   uid: Accounts.findUserByUsername('h@gmail.com')._id,
//   lat: 42.045398,  //pubs
//   lng: -87.682431
// });
// Meteor.call('locations.updateUserLocationAndAffordances', {
//   uid: Accounts.findUserByUsername('i@gmail.com')._id,
//   lat: 42.047621, //grocery, whole foods
//   lng: -87.679488
// });
// Meteor.call('locations.updateUserLocationAndAffordances', {
//   uid: Accounts.findUserByUsername('j@gmail.com')._id,
//   lat: 42.042617, //beach
//   lng: -87.671474