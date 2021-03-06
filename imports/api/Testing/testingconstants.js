import { Meteor } from "meteor/meteor";

import { Submissions } from "../OCEManager/currentNeeds";

import { addContribution } from '../OCEManager/OCEs/methods';
import {getDetectorUniqueKey} from "../UserMonitor/detectors/methods";
import {notify, notifyUsersInIncident, notifyUsersInNeed} from "../OpportunisticCoordinator/server/noticationMethods";
import {Incidents} from "../OCEManager/OCEs/experiences";

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
  },
  'sushi': { // sashimi sashimi near whole foods
    lat: 42.048068,
    lng: -87.6811262
  },
  'grocery2': {
    lat: 42.039818,
    lng: -87.680088
  }
};

let USERS = {
  garrett: {
    username: 'garrett',
    email: 'garret@email.com',
    password: 'password',
    profile: {
      firstName: 'Garrett',
      lastName: 'Hedman',
      staticAffordances: {
        mechanismRich: true
      }
    }
  },
  garretts_brother: {
    username: 'garretts_brother',
    email: 'garretts_brother@email.com',
    password: 'password',
    profile: {
      firstName: 'Barrett', // theres an inside joke to this one
      lastName: 'Hedman'
    }
  },
  meg: {
    username: 'meg',
    email: 'meg@email.com',
    password: 'password',
    profile: {
      firstName: 'Meg',
      lastName: 'Grasse'
    }
  },
  megs_sister: {
    username: 'megs_sister',
    email: 'megs_sister@email.com',
    password: 'password',
    profile: {
      firstName: 'Sister of Meg',
      lastName: 'Grasse'
    }
  },
  andrew: {
    username: 'andrew',
    email: 'andrew@email.com',
    password: 'password',
    profile: {
      firstName: 'Andrew',
      lastName: 'Finke'
    }
  },
  josh: {
    username: 'josh',
    email: 'josh@email.com',
    password: 'password',
    profile: {
      firstName: 'Josh',
      lastName: 'Shi'
    }
  },
  nagy: {
    username: 'nagy',
    email: 'nagy@email.com',
    password: 'password',
    profile: {
      firstName: 'Nagy',
      lastName: 'Hakim'
    }
  },
  bonnie: {
    username: 'bonnie',
    email: 'bonnie@email.com',
    password: 'password',
    profile: {
      firstName: 'Bonnie',
      lastName: 'Ishiguro'
    }
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
    variables: ['var sunset;'],
    rules: ['(sunset);']
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
  eating_pizza: {
    _id: "D5QSW6S4mNUsxZPq7",
    description: "eating pizza",
    variables: ["var pizza;"],
    rules: ["(pizza);"]
  },
  big_bite_restaurant: {
    _id : "kJQ8sCFbWddhMviMX",
    description : "hand-held meals eaten with big bites",
    variables : [
      "var mexican;",
      "var foodstands;",
      "var cafes;",
      "var delicatessen;",
      "var driveintheater;",
      "var cheesesteaks;",
      "var hotdog;",
      "var salvadoran;",
      "var colombian;",
      "var delis;",
      "var wraps;",
      "var hotdogs;",
      "var burgers;",
      "var tacos;",
      "var tex_mex;",
      "var newmexican;",
      "var foodtrucks;",
      "var bagels;",
      "var comfortfood;",
      "var sandwiches;",
      "var argentine;",
      "var bakeries;",
      "var cuban;"
    ],
    rules : [
      "(((cafes || delicatessen) || ((delis || wraps) || ((bagels || comfortfood) || ((sandwiches || argentine) || (bakeries || cuban))))) || ((driveintheater || cheesesteaks) || ((hotdogs || burgers) || hotdog))) || ((mexican || foodstands) || ((salvadoran || colombian) || ((tacos || tex_mex) || (newmexican || foodtrucks))));"
    ]
  }
};

/**
 * Create Storytime Helper.
 *
 * @param version [number] determines which detector comes first
 * @return {{_id: string, name: string, participateTemplate: string, resultsTemplate: string, contributionTypes: *[], description: string, notificationText: string, callbacks: *[]}}
 */
function createStorytime(version) {
  // setup places and detectors for storytime
  let places = ["niceish_day", "beer", "train", "forest", "dinning_hall", "castle", "field", "gym"];
  let detectorUniqueKeys = places.map((x) => { return Random.id(); });
  let detectorNames = [];
  let dropdownText = [
    'Swirling Clouds',
    'Drinking butterbeer',
    'Hogwarts Express',
    'Forbidden Forest',
    'Dinner at the Great Hall',
    'Hogwarts Castle',
    'Quidditch Pitch',
    'Training in the Room of Requirement ',
  ];

  _.forEach(places, (place, i) => {
    let newVars = JSON.parse(JSON.stringify(DETECTORS[place]['variables']));
    newVars.push(`var participatedInStorytime${version};`);
    newVars.push(`var mechanismRich;`);
    let newRules = JSON.parse(JSON.stringify(DETECTORS[place]['rules']));
    // modify last detector rule
    // when rules has a flat structure where rules.length == 1, last rule is the predicate
    // i.e. ['(diners || restaurants || cafeteria || food_court);']
    // when rules have a nested structure where rules.length > 1, last rule is the predicate
    // i.e. ['worship_places = (buddhist_temples || churches);', '(worship_places || landmarks);']
    let lastRule = newRules.pop();
    // each rule has a `;` at end, i.e. (rain && park);
    // in order to modify the rule, must add predicate preceding the rule
    let lastRuleNoSemicolon = lastRule.split(';')[0];
    lastRule = `(mechanismRich && (!participatedInStorytime${version} && (${lastRuleNoSemicolon})));`;
    newRules.push(lastRule);

    let detectorName = `${place}_storytime${version}_mechanismRich`;
    detectorNames.push(detectorName);

    DETECTORS[detectorName] = {
      '_id': detectorUniqueKeys[i],
      'description': `${DETECTORS[place].description} storytime${version} mechanismRich`,
      'variables': newVars,
      'rules': newRules
    };
  });

  // Don't assume the Random detectorUniqueKeys we created actually exist
  detectorUniqueKeys = detectorNames.map((name) => { return getDetectorUniqueKey(DETECTORS[name]); });
  let DROPDOWN_OPTIONS = _.zip(dropdownText, detectorUniqueKeys);
  // create story starting point
  let sentences = [
    'Ron looked up at the clouds swirling above him.',
    'Hermoine looked into her goblet, hardly realizing the unusual color of the concoction she was being forced to drink.',
    'Harry prepared himself for a lunge, and then dove forward towards the Platform 9 3/4 wall.',
    'The wizard looked down at their feet, hardly believing the magical plants growing in the Forbidden Forest.',
    'Any young wizard who has their first meal in the Hogwarts Great Hall has to be surprised by the type of food on the menu.',
    'Hogwarts castle had looked so good in photos, but this new wizard looked up at it unimpressed.',
    'Harry Potter saw the snitch diving towards the ground. He aimed his broom towards the grassy ground and followed, reaching his hand out to grab it.',
    'The new wizard of Dumbledore\'s Army was training very hard in the Room of Requirement.'
  ];
  let firstSentence = sentences[version];
  let [firstSituation, firstDetector] = DROPDOWN_OPTIONS[version];
  // notify users when story is complete
  let sendNotification = function (sub) {
    let uids = Submissions.find({iid: sub.iid}).fetch().map(function (x) {
      return x.uid;
    });

    notify(uids, sub.iid, 'Our story is finally complete. Click here to read it!',
      '', '/apicustomresults/' + sub.iid + '/' + sub.eid);
  };

  /**
   * NOTE: if callback depends on any variables defined outside of its scope, we must use some solution so that
   * the variables values are substituted into the callback.toString()
   *
   * For a dynamic code generation solution,
   * @see https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
   * @see https://medium.com/@oprearocks/serializing-object-methods-using-es6-template-strings-and-eval-c77c894651f0
   * @param sub
   */
  let storytimeCallback = function (sub) {
    Meteor.users.update({
      _id: sub.uid
    }, {
      $set: {
        ['profile.staticAffordances.participatedInStorytime${version}']: true
      }
    });

    // set affordances for storytime
    let affordance = sub.content.affordance;

    // HACKY TEMPLATE DYNAMIC CODE GENERATION
    let options = eval('${JSON.stringify(DROPDOWN_OPTIONS)}');

    let [situation, detectorUniqueKey] = options.find(function(x) {
      return x[1] === affordance;
    });

    // options = options.filter(function (x) {
    //   return x[1] !== affordance;
    // });

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
        situation: situation,
        previousUserId: sub.uid,
        dropdownChoices: {
          name: 'affordance',
          options: options
        }
      },
      numberNeeded: 1,
      notificationDelay: 90
    };

    addContribution(sub.iid, contribution);
  };

  // FIXME(rlouie): Can't have more than version 0,1,2
  let exp_names = [
    "A Ron Weasley Story",
    "A Hermoine Granger Story",
    "A Harry Potter Story"
  ];

  // create and return storytime experience
  return {
    _id: Random.id(),
    name: exp_names[version],
    participateTemplate: 'storyPage',
    resultsTemplate: 'storybook',
    contributionTypes: [{
      needName: 'pageOne',
      situation: {
        detector: firstDetector,
        number: '1'
      },
      toPass: {
        instruction: firstSentence,
        firstSentence: firstSentence,
        situation: firstSituation,
        dropdownChoices: {
          name: 'affordance',
          options: DROPDOWN_OPTIONS
        }
      },
      numberNeeded: 1,
      notificationDelay: 90
    }],
    description: 'We\'re writing a Harry Potter spin-off story',
    notificationText: 'View this and other available experiences',
    callbacks: [
      {
        trigger: 'cb.newSubmission() && (cb.numberOfSubmissions() <= 7)',
        // substitute any variables used outside of the callback function scope
        function: eval('`' + storytimeCallback.toString() + '`'),
      },
      {
        trigger: 'cb.incidentFinished()',
        function: sendNotification.toString()
      }]
  };
}

/**
 * createStorytimeImproved (improved on May 30th 2019)
 *
 * @param knowsGroup (e.g., "knowsOlin")
 * @param version (e.g., 0 determines a starting point in the story of 0)
 * @return {{contributionTypes: {notificationDelay: number, numberNeeded: number, needName: string, toPass: {firstSentence: string, instruction: string, dropdownChoices: {name: string, options: *}, situation}, situation: {number: string, detector}}[], participateTemplate: string, notificationText: string, name: string, resultsTemplate: string, description: string, callbacks: *[], _id: *}}
 */
const createStorytimeImproved = (group, version) => {
  const knowsGroup = `knows${group}`;

  // setup places and detectors for storytime
  let places = ["niceish_day", "bar", "train", "forest", "restaurant", "gym"];
  let detectorUniqueKeys = places.map((x) => { return Random.id(); });
  let detectorNames = [];
  let dropdownText = [
    'Swirling Clouds',
    'Drinking butterbeer',
    'Hogwarts Express',
    'Forbidden Forest',
    'Dinner at the Great Hall',
    'Training in the Room of Requirement',
  ];
  const notificationSubjects = [
    'Is the weather cloudy today?',
    'Drinking at a bar?',
    'Waiting at a train station?',
    'Are you at a park?',
    'Eating out at a restaurant?',
    'Working out at the gym?'
  ];
  const notificationTexts = [
    'Create a story with others using the cloudy scene above you',
    'Create a story with others using the bar scene around you',
    'Create a story with others using the train station scene around you',
    'Create a story with others using the park scene around you',
    'Create a story with others using the dining scene around you',
    'Create a story with others using the gym scene around you',
  ];

  // updating detector rules to have static affordances
  _.forEach(places, (place, i) => {
    let newVars = JSON.parse(JSON.stringify(DETECTORS[place]['variables']));
    newVars.push(`var ${knowsGroup};`);
    let newRules = JSON.parse(JSON.stringify(DETECTORS[place]['rules']));
    // modify last detector rule
    // when rules has a flat structure where rules.length == 1, last rule is the predicate
    // i.e. ['(diners || restaurants || cafeteria || food_court);']
    // when rules have a nested structure where rules.length > 1, last rule is the predicate
    // i.e. ['worship_places = (buddhist_temples || churches);', '(worship_places || landmarks);']
    let lastRule = newRules.pop();
    // each rule has a `;` at end, i.e. (rain && park);
    // in order to modify the rule, must add predicate preceding the rule
    let lastRuleNoSemicolon = lastRule.split(';')[0];
    lastRule = `(${knowsGroup} && (${lastRuleNoSemicolon}))`;
    newRules.push(lastRule);

    let detectorName = `${place}_storytime_${knowsGroup}`;
    detectorNames.push(detectorName);

    DETECTORS[detectorName] = {
      '_id': detectorUniqueKeys[i],
      'description': `${DETECTORS[place].description} storytime ${knowsGroup}`,
      'variables': newVars,
      'rules': newRules
    };
  });

  // Don't assume the Random detectorUniqueKeys we created actually exist
  detectorUniqueKeys = detectorNames.map((name) => { return getDetectorUniqueKey(DETECTORS[name]); });
  let DROPDOWN_OPTIONS = _.zip(dropdownText, detectorUniqueKeys);
  let NOTIF_SUBJECT_OPTIONS = _.zip(notificationSubjects, detectorUniqueKeys);
  let NOTIF_TEXT_OPTIONS = _.zip(notificationTexts, detectorUniqueKeys);

  // create story starting point
  let sentences = [
    'Ron looked up at the clouds swirling above him.',
    'Hermoine looked into her goblet, hardly realizing the unusual color of the concoction she was being forced to drink.',
    'Harry prepared himself for a lunge, and then dove forward towards the Platform 9 3/4 wall.',
    'The wizard looked down at their feet, hardly believing the magical plants growing in the Forbidden Forest.',
    'Any young wizard who has their first meal in the Hogwarts Great Hall has to be surprised by the type of food on the menu.',
    'The new wizard of Dumbledore\'s Army was training very hard in the Room of Requirement.'
  ];
  let firstSentence = sentences[version];
  let [firstSituation, firstDetector] = DROPDOWN_OPTIONS[version];
  let [firstNotificationSubject, _1] = NOTIF_SUBJECT_OPTIONS[version];
  let [firstNotificationText, _2] = NOTIF_TEXT_OPTIONS[version];
  // notify users when story is complete
  let sendNotification = function (sub) {
    let uids = Submissions.find({iid: sub.iid}).fetch().map(function (x) {
      return x.uid;
    });

    notify(uids, sub.iid, 'Our story is finally complete. Click here to read it!',
      '', '/apicustomresults/' + sub.iid + '/' + sub.eid);
  };

  /**
   * NOTE: if callback depends on any variables defined outside of its scope, we must use some solution so that
   * the variables values are substituted into the callback.toString()
   *
   * For a dynamic code generation solution,
   * @see https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
   * @see https://medium.com/@oprearocks/serializing-object-methods-using-es6-template-strings-and-eval-c77c894651f0
   * @param sub
   */
  const storytimeCallbackImproved = function (sub) {
    // coordinator/strategizer handles repitition in experiences

    // set affordances for storytime
    let affordance = sub.content.affordance;

    // HACKY TEMPLATE DYNAMIC CODE GENERATION
    let options = eval('${JSON.stringify(DROPDOWN_OPTIONS)}');
    let notification_subject_options = eval('${JSON.stringify(NOTIF_SUBJECT_OPTIONS)}');
    let notification_text_options = eval('${JSON.stringify(NOTIF_TEXT_OPTIONS)}');

    let [situation, detectorUniqueKey] = options.find(function(x) {
      return x[1] === affordance;
    });
    let [notificationSubject, _1] = notification_subject_options.find(function(x) {
      return x[1] === affordance;
    });
    let [notificationText, _2] = notification_text_options.find(function(x) {
      return x[1] === affordance;
    });


    // options = options.filter(function (x) {
    //   return x[1] !== affordance;
    // });

    // add need if not all pages are done
    let needName = 'page' + Random.id(3);
    if (cb.numberOfSubmissions() === 15) {
      needName = 'pageFinal'
    }

    // create and add contribution
    let contribution = {
      needName: needName,
      notificationSubject: notificationSubject,
      notificationText: notificationText,
      situation: {
        detector: affordance,
        number: '1'
      },
      toPass: {
        instruction: sub.content.sentence,
        situation: situation,
        previousUserId: sub.uid,
        dropdownChoices: {
          name: 'affordance',
          options: options
        }
      },
      numberNeeded: 1,
      notificationDelay: 90
    };

    addContribution(sub.iid, contribution);
  };

  // FIXME(rlouie): Can't have more than version 0,1,2
  let exp_names = [
    "A Ron Weasley Story",
    "A Hermoine Granger Story",
    "A Harry Potter Story"
  ];

  // create and return storytime experience
  return {
    _id: Random.id(),
    name: exp_names[version],
    group: group,
    participateTemplate: 'storyPage',
    resultsTemplate: 'storybook',
    repeatContributionsToExperienceAfterN: 1, // let one people participate before I can again
    contributionTypes: [{
      needName: 'pageOne',
      notificationSubject: firstNotificationSubject,
      notificationText: firstNotificationText,
      situation: {
        detector: firstDetector,
        number: '1'
      },
      toPass: {
        instruction: firstSentence,
        firstSentence: firstSentence,
        situation: firstSituation,
        dropdownChoices: {
          name: 'affordance',
          options: DROPDOWN_OPTIONS
        }
      },
      numberNeeded: 1,
      notificationDelay: 90
    }],
    description: "Create a story with others, told through people's everyday surroundings",
    callbacks: [
      {
        trigger: `cb.newSubmission() && (cb.numberOfSubmissions() <= 15)`,
        // substitute any variables used outside of the callback function scope
        function: eval('`' + storytimeCallbackImproved.toString() + '`'),
      },
      {
        trigger: 'cb.incidentFinished()',
        function: sendNotification.toString()
      }]
  };
};

const createIndependentStorybook = () => {

  let place_situation_delay = [
    ["niceish_day",'Swirling Clouds', 5],
    ["beer", 'Drinking butterbeer', 90],
    ["train", 'Hogwarts Express', 90],
    ["forest",'Forbidden Forest', 90],
    ["dinning_hall",'Dinner at the Great Hall', 90],
    ["castle",'Hogwarts Castle', 90],
    ["field",'Quidditch Pitch', 90],
    ["gym",'Training in the Room of Requirement', 90]
  ];

  return {
    _id: Random.id(),
    name: 'Humans of Hogwarts',
    participateTemplate: 'storyPage_noInterdependence',
    resultsTemplate: 'storyBook_noInterdependence',
    contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', (function(place_situation_delay) {
      return place_situation_delay.map((x) => {
        let [place, situation, delay] = x;
        return {
          needName: situation,
          situation: {
            detector: getDetectorUniqueKey(DETECTORS[place]),
            number: '1',
          },
          toPass: {
            situation: situation
          },
          numberNeeded: 2,
          notificationDelay: delay
        }
      });
    })(place_situation_delay)),
    description: 'We\'re writing a Harry Potter spin-off story',
    notificationText: 'View this and other available experiences',
    callbacks: [
      {
        trigger: 'cb.newSubmission()',
        function: (notifyUsersInIncident('Someone added to Humans of Hogwarts',
          'View photos and lines others have created')).toString()
      },
      {
        trigger: 'cb.incidentFinished()',
        function: (notifyUsersInIncident('Humans of Hogwarts has finished',
          "View everyone's photos and lines that were contributed")).toString()
      }]
  };
};

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
      let lastRuleNoSemicolon = lastRule.split(';')[0];
      lastRule = `(${relationship} && (${lastRuleNoSemicolon}));`;
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
            detector: getDetectorUniqueKey(detector),
            number: '2'
          },
          toPass: {
            instruction: 'You are at a  ' + place[1] + ' at the same time as '
          },
          numberNeeded: 2,
          notificationDelay: 90
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
    notificationDelay = 90
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

/**
 *
 * @param numberInSituation [Number] Controls asynchronous vs synchronous. Defaults to Asynchronous.
 * @return {*[]}
 */
const sameSituationContributionTypes = function(
  {
    numberInSituation = 1
  } = {}
) {
  return [{
    needName: 'Warm, Sunny Weather',
    situation: {
      detector: DETECTORS.sunny._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you enjoying <span style="color: #0351ff">good weather today?</span> Share a photo of how you are experiencing the sun.'
    },
    numberNeeded: 50,
    notificationDelay: 1,
    allowRepeatContributions: true,
  }, {
    needName: 'Shopping for groceries',
    notificationSubject: 'Inside a grocery store?',
    notificationText: 'Participate in an experience where you and others are "Grocery Shopping"',
    situation: {
      detector: DETECTORS.grocery._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you <span style="color: #0351ff">shopping for groceries?</span> Share a photo of what you are buying or looking at.'
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: 'Visiting a Cafe',
    situation: {
      detector: DETECTORS.coffee._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you <span style="color: #0351ff">at a cafe?</span> Share a photo of yourself with what you purchased, or what you are doing.'
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: 'Going out for drinks',
    situation: {
      detector: DETECTORS.bar._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you out <span style="color: #0351ff">drinking at the bar?</span> Share a photo of yourself at this bar.',
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: 'Eating Japanese Food',
    situation: {
      detector: DETECTORS.eating_japanese._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you eating <span style="color: #0351ff">Japanese food?</span> Share a photo of yourself dining at this restaurant.'
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: 'Religious Worship',
    situation: {
      detector: DETECTORS.castle._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you at a <span style="color: #0351ff">center for religious worship?</span> Share a photo of something around you.'
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: 'Enjoy sunset',
    situation: {
      detector: DETECTORS.sunset._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you out during <span style="color: #0351ff">sunset?</span> Share a photo of what the sky looks like where you are.'
    },
    numberNeeded: 50,
    notificationDelay: 1,
    allowRepeatContributions: true,
  }, {
    needName: 'Eating Asian Food',
    situation: {
      detector: DETECTORS.eating_with_chopsticks._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you <span style="color: #0351ff">eating at an asian restaurant?</span> Share a photo of yourself dining out right now.'
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: 'Studying at the library',
    situation: {
      detector: DETECTORS.library._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Are you spending part of the day <span style="color: #0351ff">reading?</span> Share a photo of what you are doing.'
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: 'Greenery',
    situation: {
      detector: DETECTORS.forest._id,
      number: numberInSituation
    },
    toPass: {
      instruction: '<span style="color: #0351ff">Are you spending time at a park?</span> Share a photo of what is going on around you.'
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: 'Rainy Day',
    situation: {
      detector: DETECTORS.rainy._id,
      number: numberInSituation
    },
    toPass: {
      instruction: 'Is it <span style="color: #0351ff">raining</span> today? Share a photo of what it looks like outside.'
    },
    numberNeeded: 50,
    notificationDelay: 1,
    allowRepeatContributions: true,
  }, {
    needName: "Eating some 'Za",
    situation: {
      detector: DETECTORS.eating_pizza._id,
      number: '1'
    },
    toPass: {
      instruction: 'Are you <span style="color: #0351ff">eating pizza</span> today? Share a photo of yourself at the pizza restaurant.',
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: "Eating out",
    situation: {
      detector: DETECTORS.restaurant._id,
      number: '1'
    },
    toPass: {
      instruction: 'Are you <span style="color: #0351ff">eating out</span> today? Share a photo of yourself at the restaurant.',
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }, {
    needName: "Eating Big Bites",
    situation: {
      detector: DETECTORS.big_bite_restaurant._id,
      number: '1'
    },
    toPass: {
      instruction: 'Are you <span style="color: #0351ff">eating burritos, sandwiches, or burgers</span> today? Share a photo of yourself at the restaurant.',
    },
    numberNeeded: 50,
    notificationDelay: 90,
    allowRepeatContributions: true,
  }];
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
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-fruit-in-hand.jpg'
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
    notificationDelay: 90,
  }, {
    needName: 'Raise a glass',
    situation: {
      detector: DETECTORS.bar._id,
      number: '1'
    },
    toPass: {
      instruction: 'What are you drinking? Take a photo, while raising your glass or bottle in front of you.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-cheers.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 90,
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
    notificationDelay: 90,
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
    notificationDelay: 90
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
    notificationDelay: 90,
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
    notificationDelay: 90
  }, {
    needName: 'Hold a plant',
    situation: {
      detector: DETECTORS.forest._id,
      number: '1'
    },
    toPass: {
      instruction: 'Find a plant in the <span style="color: #0351ff">park or garden</span>. Take a photo, with your hand shaped as a half-circle.',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-hand-circles-flower.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 90
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
    notificationDelay: 90
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
    notificationDelay: 90
  }, {
    needName: 'Puddles',
    situation: {
      detector: DETECTORS.rainy._id,
      number: '1'
    },
    toPass: {
      instruction: 'Is it <span style="color: #0351ff">raining</span> today? Find a <span style="color: #0351ff">puddle</span> on the ground. Take a photo of yourself, stomping on the puddle!',
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-puddle-feet.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 1,
  }, {
    needName: "Slice of 'Za",
    situation: {
      detector: DETECTORS.eating_pizza._id,
      number: '1'
    },
    toPass: {
      instruction: `Did you order <span style="color: #0351ff">pizza</span>? Hold up a <span style="color: #0351ff">slice of 'Za</span> and take a photo of half the slice!`,
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-pizza-slice.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 90
  }, {
    needName: "Do you take cream with that",
    situation: {
      detector: DETECTORS.coffee._id, // any place that has cups (cafes + bars + restaurants)
      number: '1'
    },
    toPass: {
      instruction: `Do you have <span style="color: #0351ff">a cup or glass</span> you are drinking? Take a photo with it in the middle of the picture. You can even try to <span style="color: #0351ff">pour some extra "cream"</span> into it too!`,
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-teasing-lotion-in-a-cup.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 90
  }, {
    needName: "Eat from the same bowl", // bowl? Plate?  (basically all restaurants)
    situation: {
      detector: DETECTORS.restaurant._id,
      number: '1'
    },
    toPass: {
      instruction: `Are you <span style="color: #0351ff">eating out</span> right now? Take a photo of yourself holding up <span style="color: #0351ff">a bowl or plate</span> to the middle of the screen.`,
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-bowls-up.jpg'
    },
    numberNeeded: 50,
    notificationDelay: 90
  }, {
    needName: "Big Bites", // Any restaurant that would serve something you'd eat with your hands (burrito, tacos, hotdogs, sandwiches, wraps, burgers, tradamerican, newamerican )
    situation: {
      detector: DETECTORS.big_bite_restaurant._id,
      number: '1'
    },
    toPass: {
      instruction: `Are you <span style="color: #0351ff">eating food that would require a big bite</span> right now? Take a photo of yourself <span style="color: #0351ff">holding up your food</span> to the middle of the screen.`,
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-big-bite.jpg'
    },
    numberNeeded: 50,
  }, {
    needName: "Friday Night",
    situation: {
      detector: DETECTORS.big_bite_restaurant._id,
      number: '1'
    },
    toPass: {
      instruction: `Are you <span style="color: #0351ff">eating out</span> right now? Take a photo of yourself holding up <span style="color: #0351ff">a bowl or plate</span> to the middle of the screen.`,
      exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-bowls-up.jpg'
    },
    numberNeeded: 50,
  }]
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

/**
 * Side effect: Changes the global DETECTORS object, adding another detector with key "detectorKey_staticAffordance"
 *
 * @param staticAffordance
 * @param detectorKey
 * @returns newDetectorKey
 */
const addStaticAffordanceToDetector = function(staticAffordance, detectorKey) {
  let newVars = JSON.parse(JSON.stringify(DETECTORS[detectorKey]['variables']));
  newVars.push(`var ${staticAffordance};`);
  let newRules = JSON.parse(JSON.stringify(DETECTORS[detectorKey]['rules']));
  // modify last detector rule
  // when rules has a flat structure where rules.length == 1, last rule is the predicate
  // i.e. ['(diners || restaurants || cafeteria || food_court);']
  // when rules have a nested structure where rules.length > 1, last rule is the predicate
  // i.e. ['worship_places = (buddhist_temples || churches);', '(worship_places || landmarks);']
  let lastRule = newRules.pop();
  // each rule has a `;` at end, i.e. (rain && park);
  // in order to modify the rule, must add predicate preceding the rule
  let lastRuleNoSemicolon = lastRule.split(';')[0];
  lastRule = `(${staticAffordance} && (${lastRuleNoSemicolon}));`;
  newRules.push(lastRule);

  let newDetectorKey = `${detectorKey}_${staticAffordance}`;
  // Change DETECTORS if newDetectorKey does not already exist (some experiences might have already created coffee_mechanismRich, for example)
  if (!(newDetectorKey in DETECTORS)) {
    DETECTORS[newDetectorKey] = {
      '_id': Random.id(),
      'description': `${DETECTORS[detectorKey].description} ${staticAffordance}`,
      'variables': newVars,
      'rules': newRules
    };
  }
  return newDetectorKey;
};

/**
 *
 * @param staticAffordances [String] the affordance to add
 *        i.e. 'mechanismRich'
 * @param contributionTypes [Array] list of all the needs by which to modify
 * @return
 */
const addStaticAffordanceToNeeds = function(staticAffordance, contributionTypes) {
  return _.map(contributionTypes, (need) => {
    const detectorKey = _.keys(DETECTORS).find(key => getDetectorUniqueKey(DETECTORS[key]) === need.situation.detector);
    if (!detectorKey) {
      throw `Exception in addStaticAffordanceToNeeds: could not find corresponding detector for ${JSON.stringify(need)}`
    }
    const newDetectorKey = addStaticAffordanceToDetector(staticAffordance, detectorKey);
    need.situation.detector = getDetectorUniqueKey(DETECTORS[newDetectorKey]);
    return need;
  });
};

/**
 *
 * @param contributionTypes
 * @param triggerTemplate [String] should be written as a string, with ES6 templating syntax
 *        i.e. "cb.newSubmission(\"${need.needName}\")"
 *        If using templating syntax, you have access to the each individual need object
 * @param sendNotificationFn
 */
const notifCbForMultiNeeds = function(contributionTypes, triggerTemplate, sendNotificationFn) {
  return contributionTypes.map((need) => {
    return {
      trigger: eval('`' + triggerTemplate + '`'),
      function: sendNotificationFn.toString()
    };
  });
};

/** halfhalfRespawnAndNotify:
 * This is a helper function that generates a callback function definition
 * The callback will respawn or create a duplicate of the need that just completed,
 * while also sending notifications to the participants of that need.
 *
 * This function makes strong assumptions about how your OCE contributionTypes are written.
 * i.e. need.needName = 'Name of my need 1'
 * i.e. need.needName = 'Hand Silhouette 1'
 *
 * @param subject [String] subject of notification
 * @param text [String] accompanying subtext of notification
 * @return {any} A function
 */
const halfhalfRespawnAndNotify = function(subject, text) {
  const functionTemplate = function (sub) {
    let contributionTypes = Incidents.findOne(sub.iid).contributionTypes;
    let need = contributionTypes.find((x) => {
      return x.needName === sub.needName;
    });

    // Convert Need Name i to Need Name i+1
    let splitName = sub.needName.split(' ');
    let iPlus1 = Number(splitName.pop()) + 1;
    splitName.push(iPlus1);
    let newNeedName = splitName.join(' ');

    need.needName = newNeedName;
    addContribution(sub.iid, need);

    let participants = Submissions.find({
      iid: sub.iid,
      needName: sub.needName
    }).map((submission) => {
      return submission.uid;
    });

    notify(participants, sub.iid, '${subject}', '${text}', '/apicustomresults/' + sub.iid + '/' + sub.eid);
  };
  return eval('`'+functionTemplate.toString()+'`');
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
  // bumped: createBumped(),
  storyTime: createStorytime(0),
  storyTime1: createStorytime(1),
  storyTime2: createStorytime(2),
  // storyTime3: createStorytime(3),
  // storyTime4: createStorytime(4),
  // storyTime5: createStorytime(5),
  // storyTime6: createStorytime(6),
  // storyTime7: createStorytime(7),
  // independentStorybook: createIndependentStorybook(),
  // sunset: {
  //   _id: Random.id(),
  //   name: 'Sunset',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'sunset',
  //   contributionTypes: [{
  //     needName: 'sunset',
  //     situation: {
  //       detector: DETECTORS.sunset._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Take a photo of the sunset!'
  //     },
  //     numberNeeded: 20,
  //     notificationDelay: 1,
  //   }],
  //   description: 'Create a timelapse of the sunset with others around the country',
  //   notificationText: 'Take a photo of the sunset!',
  //   callbacks: [{
  //     trigger: 'cb.incidentFinished()',
  //     function: sendNotificationSunset.toString()
  //   }]
  // },
  // halfhalf24: {
  //   _id: Random.id(),
  //   name: 'Half Half over 24 hours',
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults', // FIXME(rlouie): should be a template grouped by time
  //   contributionTypes: create24hoursContributionTypes(
  //     function(i) {
  //       let zpad_i = ("00" + i).slice(-2);
  //       let toPass = {
  //         instruction: `<span style="color: #0351ff">This experience is for testing the Half Half Photo Experience!</span><b> Take a picture of what you are doing today at hour ${zpad_i}:00 today.</b>`
  //       };
  //       return toPass;
  //     },
  //     10
  //   ),
  //   description: 'Create a photo collage of what you and others are doing at each of the hours in a day',
  //   notificationText: 'Take a photo of what you are doing at this hour',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: sendNotificationNew24HourPhotoAlbumSub.toString()
  //   }]
  // },
  // halfhalfAsynch: createHalfHalf(),
  // halfhalfSynch: createHalfHalf({numberInSituation: 2}),
  // halfhalfDay: {
  //   _id: Random.id(),
  //   name: 'Half Half Daytime',
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: [{
  //     needName: 'half half: daytime', // FIXME: make more semantically meaningful
  //     situation: {
  //       detector: DETECTORS.daytime._id,  // For testing during workday
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Take a photo of like Half Half Travel!'
  //     },
  //     numberNeeded: 50, // arbitrarily high for a study
  //     notificationDelay: 1,
  //   }],
  //   description: 'Create adventures that meet halfway! Ready to live in a parallel with someone else?',
  //   notificationText: 'Participate in Half Half Travel!',
  //   callbacks: [{
  //     trigger: 'cb.numberOfSubmissions("half half: daytime") % 2 === 0',
  //     function: sendNotificationTwoHalvesCompleted.toString()
  //   }]
  // },
  // halfhalfNight: {
  //   _id: Random.id(),
  //   name: 'Half Half Nighttime',
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: [{
  //     needName: 'half half: nighttime', // FIXME: make more semantically meaningful
  //     situation: {
  //       detector: DETECTORS.night._id,  // For testing during evening
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Take a photo of like Half Half Travel!'
  //     },
  //     numberNeeded: 50, // arbitrarily high for a study
  //     notificationDelay: 1, // no need to delay if its daytime outside
  //   }],
  //   description: 'Create adventures that meet halfway! Ready to live in a parallel with someone else?',
  //   notificationText: 'Participate in Half Half Travel!',
  //   callbacks: [{
  //     trigger: 'cb.numberOfSubmissions("half half: nighttime") % 2 === 0',
  //     function: sendNotificationTwoHalvesCompleted.toString()
  //   }]
  // },
  halfhalf_sunny: {
    _id: Random.id(),
    name: 'Hand Silhouette',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Hand Silhouette 1',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.sunny),
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
  halfhalf_grocery: {
    _id: Random.id(),
    name: 'Grocery Buddies',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Grocery Buddies 1',
      notificationSubject: 'Inside a grocery store?',
      notificationText: 'Share an experience with others who are also grocery shopping',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.grocery),
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
  halfhalf_coffee: {
    _id: Random.id(),
    name: 'Coffee Date',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Coffee Date 1',
      notificationSubject: 'Inside a coffee shop?',
      notificationText: 'Share an experience with others who are also at a coffee shop',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.coffee),
        number: '1'
      },
      toPass: {
        instruction: 'Are you at a <span style="color: #0351ff">cafe</span>? Take a photo, <span style="color: #0351ff">holding your cup, mug, or plate</span> towards the center of the screen.',
        exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-cafe.jpg'
      },
      numberNeeded: 2,
      notificationDelay: 90,
    }]),
    description: 'While enjoying a cafe beverage, create a half half photo.',
    notificationText: 'View this and other available experiences',
    callbacks: [{
      trigger: '(cb.numberOfSubmissions() % 2) === 0',
      function: halfhalfRespawnAndNotify('A Coffee Date photo completed','View the photo').toString()
    }]
  },
  halfhalf_bar: {
    _id: Random.id(),
    name: 'Cheers',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Cheers 1',
      notificationSubject: 'Drinking at a bar?',
      notificationText: 'Share an experience with others who are also drinking at a bar',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.bar),
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
  // halfhalf_japanese: {
  //   _id: Random.id(),
  //   name: 'Itadakimasu',
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
  //     // needName MUST have structure "My Need Name XYZ"
  //     needName: 'Itadakimasu 1',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.eating_japanese),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Take a photo, while <span style="color: #0351ff">holding chopsticks in your hand</span>, saying "Itadakimasu" which translates to "I humbly receive this meal"',
  //       exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-itadakimasu.jpg'
  //     },
  //     numberNeeded: 2,
  //     notificationDelay: 90,
  //   }]),
  //   description: 'While eating Japanese Food, create a half half photo.',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: '(cb.numberOfSubmissions() % 2) === 0',
  //     function: halfhalfRespawnAndNotify('A Itadakimasu photo completed','View the photo').toString()
  //   }]
  // },
  halfhalf_religious: {
    _id: Random.id(),
    name: 'Religious Architecture',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Religious Architecture 1',
      notificationSubject: 'Visiting a place of worship?',
      notificationText: 'Share an experience with others who are also visiting a place of worship',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.castle),
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
  halfhalf_sunset: {
    _id: Random.id(),
    name: 'Sunset Together',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Sunset Together 1',
      notificationSubject: 'Can you see the sunset?',
      notificationText: 'Share an experience with others who are also watching the sunset',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.sunset),
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
  halfhalf_asian: {
    _id: Random.id(),
    name: 'Eating with Chopsticks',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Eating with Chopsticks 1',
      notificationSubject: 'Eating at an asian restaurant?',
      notificationText: 'Share an experience with others who are also eating asian food',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.eating_with_chopsticks),
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
  halfhalf_books: {
    _id: Random.id(),
    name: 'Book Buddies',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Book Buddies 1',
      notificationSubject: 'Are you at a library?',
      notificationText: 'Share an experience with others who are also at the library',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.library),
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
  // halfhalf_plantcircle: {
  //   _id: Random.id(),
  //   name: 'Hold a plant',
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
  //     // needName MUST have structure "My Need Name XYZ"
  //     needName: 'Hold a plant 1',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.forest),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Find a plant in the <span style="color: #0351ff">park or garden</span>. Take a photo, with your hand shaped as a half-circle.',
  //       exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-hand-circles-flower.jpg'
  //     },
  //     numberNeeded: 2,
  //     notificationDelay: 90,
  //   }]),
  //   description: 'While in the park, create a half half photo.',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: '(cb.numberOfSubmissions() % 2) === 0',
  //     function: halfhalfRespawnAndNotify('A Plant Circle photo completed','View the photo').toString()
  //   }]
  // },
  // halfhalf_feettotrees: {
  //   _id: Random.id(),
  //   name: 'Feet to the trees',
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
  //     // needName MUST have structure "My Need Name XYZ"
  //     needName: 'Feet to the trees 1',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.forest),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Find a <span style="color: #0351ff">patch of grass to lay your back on</span>. Then, raise your feet. Take a photo of your foot stretching high into the sky',
  //       exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-feet-towards-trees.jpg'
  //     },
  //     numberNeeded: 2,
  //     notificationDelay: 5,
  //   }]),
  //   description: 'While in the park, create a half half photo.',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: '(cb.numberOfSubmissions() % 2) === 0',
  //     function: halfhalfRespawnAndNotify('A Feet to the trees photo completed','View the photo').toString()
  //   }]
  // },
  halfhalf_leakmask: {
    _id: Random.id(),
    name: 'Leaf Mask',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Leaf Mask 1',
      notificationSubject: 'Are you at a park?',
      notificationText: 'Share an experience with others who are also at a park',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.forest),
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
  halfhalf_puddles: {
    _id: Random.id(),
    name: 'Puddle Feet',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Puddle Feet 1',
      notificationSubject: 'Are you outside while its raining?',
      notificationText: 'Share an experience with others who are enjoying or enduring the rain',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.rainy),
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
  // halfhalf_pizza: {
  //   _id: Random.id(),
  //   name: "Slice of 'Za",
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
  //     // needName MUST have structure "My Need Name XYZ"
  //     needName: "Slice of 'Za 1",
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.eating_pizza),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: `Did you order <span style="color: #0351ff">pizza</span>? Hold up a <span style="color: #0351ff">slice of 'Za</span> and take a photo of half the slice!`,
  //       exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-pizza-slice.jpg'
  //     },
  //     numberNeeded: 2,
  //     notificationDelay: 90,
  //   }]),
  //   description: 'While eating pizza, create a half half photo.',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: '(cb.numberOfSubmissions() % 2) === 0',
  //     function: halfhalfRespawnAndNotify("A \"Slice of 'Za\" photo completed",'View the photo').toString()
  //   }]
  // },
  // halfhalf_creamwiththat: {
  //   _id: Random.id(),
  //   name: "Want cream with that",
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
  //     // needName MUST have structure "My Need Name XYZ"
  //     needName: "Want cream with that 1",
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.coffee), // any place that has cups (cafes + bars + restaurants)
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: `Do you have <span style="color: #0351ff">a cup or glass</span> you are drinking? Take a photo with it in the middle of the picture. You can even try to <span style="color: #0351ff">pour some extra "cream"</span> into it too!`,
  //       exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-teasing-lotion-in-a-cup.jpg'
  //     },
  //     numberNeeded: 2,
  //     notificationDelay: 60,
  //   }]),
  //   description: 'While drinking coffee at a cafe, create a half half photo.',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: '(cb.numberOfSubmissions() % 2) === 0',
  //     function: halfhalfRespawnAndNotify("A 'Want cream with that' photo completed",'View the photo').toString()
  //   }]
  // },
  // halfhalf_eatfromsamebowl: {
  //   _id: Random.id(),
  //   name: "Share a plate",
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
  //     // needName MUST have structure "My Need Name XYZ"
  //     needName: "Share a plate 1", // bowl? Plate?  (basically all restaurants)
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.restaurant),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: `Are you <span style="color: #0351ff">eating out</span> right now? Take a photo of yourself holding up <span style="color: #0351ff">a bowl or plate</span> to the middle of the screen.`,
  //       exampleImage: 'https://s3.us-east-2.amazonaws.com/ce-platform/oce-example-images/half-half-embodied-mimicry-bowls-up.jpg'
  //     },
  //     numberNeeded: 2,
  //     notificationDelay: 60,
  //   }]),
  //   description: 'While eating out at a restaurant, create a half half photo.',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: '(cb.numberOfSubmissions() % 2) === 0',
  //     function: halfhalfRespawnAndNotify("A 'Share a Plate' photo completed",'View the photo').toString()
  //   }]
  // },
  halfhalf_bigbites: {
    _id: Random.id(),
    name: "Big Bites",
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('mechanismRich', [{
      needName: "Big Bites 1", // Any restaurant that would serve something you'd eat with your hands (burrito, tacos, hotdogs, sandwiches, wraps, burgers, tradamerican, newamerican )
      notificationSubject: 'Eating at a restaurant?',
      notificationText: 'Share an experience with others who are enjoying big bites of their meal',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.big_bite_restaurant),
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
  // halfhalfEmbodiedMimicry: {
  //   _id: Random.id(),
  //   name: 'Body Mirror',
  //   participateTemplate: 'halfhalfParticipate',
  //   resultsTemplate: 'halfhalfResults',
  //   contributionTypes: halfhalfEmbodiedContributionTypes(),
  //   description: 'With your environment as the shared canvas, pose your body to be the mirror image of a friend',
  //   notificationText: 'Your situation made you available to participate in Body Mirror!',
  //   callbacks: notifCbForMultiNeeds(
  //     halfhalfEmbodiedContributionTypes(),
  //     "cb.numberOfSubmissions(\"${need.needName}\") % 2 === 0",
  //     sendNotificationTwoHalvesCompleted)
  // },
  // situationaware_sunny: {
  //   _id: Random.id(),
  //   name: 'Sunny Days',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Sunny Days',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.sunny),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Are you enjoying <span style="color: #0351ff">good weather today?</span> Share a photo of how you are experiencing the sun.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 1,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Sunny Days', 'View the photo').toString()
  //   }]
  // },
  // situationaware_grocery: {
  //   _id: Random.id(),
  //   name: 'Feed yourself',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Feed yourself',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.grocery),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you <span style="color: #0351ff">shopping for groceries?</span> Share a photo of what you are buying or looking at.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 90,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Feed yourself', 'View the photo').toString()
  //   }]
  // },
  // situationaware_cafe: {
  //   _id: Random.id(),
  //   name: 'Cafe Days',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Cafe Days',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.coffee),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you <span style="color: #0351ff">at a cafe?</span> Share a photo of yourself with what you purchased, or what you are doing.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 90,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Cafe Days', 'View the photo').toString()
  //   }]
  // },
  // situationaware_bar: {
  //   _id: Random.id(),
  //   name: 'Hit the Bars',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Hit the Bars',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.bar),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you out <span style="color: #0351ff">drinking at the bar?</span> Share a photo of yourself at this bar.',
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 90,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Hit the Bars', 'View the photo').toString()
  //   }]
  // },
  // situationaware_japanese: {
  //   _id: Random.id(),
  //   name: 'Eating Japanese Food',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Eating Japanese Food',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.eating_japanese),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you eating <span style="color: #0351ff">Japanese food?</span> Share a photo of yourself dining at this restaurant.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 90,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Eating Japanese Food', 'View the photo').toString()
  //   }]
  // },
  // situationaware_religious: {
  //   _id: Random.id(),
  //   name: 'Religious Worship',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Religious Worship',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.castle),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you at a <span style="color: #0351ff">center for religious worship?</span> Share a photo of something around you.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 30,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Religious Worship', 'View the photo').toString()
  //   }]
  // },
  // situationaware_sunset: {
  //   _id: Random.id(),
  //   name: 'Catch the sunset',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Catch the sunset',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.sunset),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you out during <span style="color: #0351ff">sunset?</span> Share a photo of what the sky looks like where you are.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 1,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Catch the sunset', 'View the photo').toString()
  //   }]
  // },
  // situationaware_asian: {
  //   _id: Random.id(),
  //   name: 'Eating Asian Food',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Eating Asian Food',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.eating_with_chopsticks),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you <span style="color: #0351ff">eating at an asian restaurant?</span> Share a photo of yourself dining out right now.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 90,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Eating Asian Food', 'View the photo').toString()
  //   }]
  // },
  // situationaware_books: {
  //   _id: Random.id(),
  //   name: 'Reading a book',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Reading a book',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.library),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you spending part of the day <span style="color: #0351ff">reading?</span> Share a photo of what you are doing.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 90,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Reading a book', 'View the photo').toString()
  //   }]
  // },
  // situationaware_parks: {
  //   _id: Random.id(),
  //   name: 'I love parks',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'I love parks',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.forest),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Are you <span style="color: #0351ff">at a park?</span> Share a photo of what is going on around you.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 15,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for I love parks', 'View the photo').toString()
  //   }]
  // },
  // situationaware_rainy: {
  //   _id: Random.id(),
  //   name: 'Rainy Day',
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: 'Rainy Day',
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.rainy),
  //       number: 1
  //     },
  //     toPass: {
  //       instruction: 'Is it <span style="color: #0351ff">raining</span> today? Share a photo of what it looks like outside.'
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 1,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Rainy Day', 'View the photo').toString()
  //   }]
  // },
  // situationaware_pizza: {
  //   _id: Random.id(),
  //   name: "Eating some 'Za",
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: "Eating some 'Za",
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.eating_pizza),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Are you <span style="color: #0351ff">eating pizza</span> today? Share a photo of yourself at the pizza restaurant.',
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 60,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Eating some \'Za', 'View the photo').toString()
  //   }]
  // },
  // situationaware_eatout: {
  //   _id: Random.id(),
  //   name: "Eating out",
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: "Eating out",
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.restaurant),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Are you <span style="color: #0351ff">eating out</span> today? Share a photo of yourself at the restaurant.',
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 60,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Eating out', 'View the photo').toString()
  //   }]
  // },
  // situationaware_bigbite: {
  //   _id: Random.id(),
  //   name: "Eating Big Bites",
  //   participateTemplate: 'uploadPhoto',
  //   resultsTemplate: 'photosByCategories',
  //   contributionTypes: addStaticAffordanceToNeeds('mechanismPoor', [{
  //     needName: "Eating Big Bites",
  //     situation: {
  //       detector: getDetectorUniqueKey(DETECTORS.big_bite_restaurant),
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Are you <span style="color: #0351ff">eating burritos, sandwiches, or burgers</span> today? Share a photo of yourself at the restaurant.',
  //     },
  //     numberNeeded: 50,
  //     notificationDelay: 60,
  //     allowRepeatContributions: true,
  //   }]),
  //   description: 'Appreciate the small moments with others who are doing the same',
  //   notificationText: 'View this and other available experiences',
  //   callbacks: [{
  //     trigger: 'cb.newSubmission()',
  //     function: notifyUsersInNeed('New moment for Eating Big Bites', 'View the photo').toString()
  //   }]
  // },
  sameSituationAwareness: {
    _id: Random.id(),
    name: 'Our Small Moments',
    participateTemplate: 'uploadPhoto',
    resultsTemplate: 'photosByCategories',
    contributionTypes: sameSituationContributionTypes(),
    description: 'During the small moments, we might be experiencing more together than we let on.',
    notificationText: 'Your situation made you available to participate in Our Small Moments!',
    callbacks: notifCbForMultiNeeds(
      sameSituationContributionTypes(),
      "cb.newSubmission(\"${need.needName}\")",
      notifyUsersInNeed('Someone added to Our Small Moments', 'See the results under ${sub.needName}'))
  },
  scavengerHunt: {
    _id: Random.id(),
    name: 'St. Patrick\'s Day Scavenger Hunt',
    participateTemplate: 'scavengerHuntParticipate',
    resultsTemplate: 'scavengerHunt',
    contributionTypes: [{
      needName: 'beer',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.beer),
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
        detector: getDetectorUniqueKey(DETECTORS.produce),
        number: '1'
      },
      toPass: {
        instruction: 'Can you take a photo of green vegetables? #leprechaunfood'
      },
      numberAllowedToParticipateAtSameTime: 1, // for testing
      numberNeeded: 5, // for testing
      notificationDelay: 20, // 20 seconds for debugging
    }, {
      needName: 'coins',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.drugstore),
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
        detector: getDetectorUniqueKey(DETECTORS.costume_store),
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
        detector: getDetectorUniqueKey(DETECTORS.irish),
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
        detector: getDetectorUniqueKey(DETECTORS.hair_salon),
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
        detector: getDetectorUniqueKey(DETECTORS.gas_station),
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
        detector: getDetectorUniqueKey(DETECTORS.bank),
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
        detector: getDetectorUniqueKey(DETECTORS.rainbow),
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
  // natureHunt: {
  //   _id: Random.id(),
  //   name: 'Nature Scavenger Hunt',
  //   participateTemplate: 'scavengerHuntParticipate',
  //   resultsTemplate: 'scavengerHunt',
  //   contributionTypes: [{
  //     needName: 'tree',
  //     situation: {
  //       detector: DETECTORS.forest._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of a tree?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 10, // 10 seconds for debugging
  //   }, {
  //     needName: 'leaf',
  //     situation: {
  //       detector: DETECTORS.forest._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of a leaf?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 10, // 10 seconds for debugging
  //   }, {
  //     needName: 'grass',
  //     situation: {
  //       detector: DETECTORS.field._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of the grass?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 10, // 10 seconds for debugging
  //   }, {
  //     needName: 'lake',
  //     situation: {
  //       detector: DETECTORS.lake._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of the lake?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 10, // 10 seconds for debugging
  //   }, {
  //     needName: 'moon',
  //     situation: {
  //       detector: DETECTORS.night._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of the moon?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 1, // 1 seconds for debugging
  //   }, {
  //     needName: 'sun',
  //     situation: {
  //       detector: DETECTORS.sunny._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of the sun?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 1, // 1 seconds for debugging
  //   }, {
  //     needName: 'blueSky',
  //     situation: {
  //       detector: DETECTORS.sunny._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of the blue sky?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 1, // 1 seconds for debugging
  //   }, {
  //     needName: 'clouds',
  //     situation: {
  //       detector: DETECTORS.cloudy._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of the clouds?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 1, // 1 seconds for debugging
  //   }, {
  //     needName: 'puddle',
  //     situation: {
  //       detector: DETECTORS.rainy._id,
  //       number: '1'
  //     },
  //     toPass: {
  //       instruction: 'Can you take a photo of the puddle?'
  //     },
  //     numberNeeded: 1,
  //     notificationDelay: 1, // 1 seconds for debugging
  //   }],
  //   description: 'Find an item for a scavenger hunt',
  //   notificationText: 'Help us out with our nature scavenger hunt',
  //   callbacks: [{
  //     trigger: 'cb.incidentFinished()',
  //     function: sendNotificationScavenger.toString()
  //   }]
  // },
  // foodfight: {
  //   _id: Random.id(),
  //   name: "Food Fight!",
  //   participateTemplate: "scavengerHuntParticipate",
  //   resultsTemplate: "scavengerHunt",
  //   contributionTypes: [
  //     {
  //       needName: "foodPhoto",
  //       situation: {
  //         detector: DETECTORS.restaurant._id,
  //         number: 1
  //       },
  //       toPass: {
  //         instruction: "Can you take a photo of what you're eating?"
  //       },
  //       numberNeeded: 1
  //     },
  //     {
  //       needName: "foodPhoto",
  //       situation: {
  //         detector: DETECTORS.restaurant._id,
  //         number: 1
  //       },
  //       toPass: {
  //         instruction: "Can you take a photo of what you're eating?"
  //       },
  //       numberNeeded: 1
  //     }
  //   ],
  //   description: "Food fight!",
  //   notificationText: "Food fight!",
  //   callbacks: [{
  //       trigger: "cb.incidentFinished()",
  //       function: sendNotificationFoodFight.toString()
  //   }]
  // }
};

let CHI20_DTR_EXPERIENCES =  {
  storytime_knowsDTR: createStorytimeImproved('DTR', 1), // version 1 starts with bars
  halfhalf_sunny_knowsDTR: {
    _id: Random.id(),
    name: 'Hand Silhouette',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Hand Silhouette 1',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.sunny),
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
  halfhalf_grocery_knowsDTR: {
    _id: Random.id(),
    name: 'Grocery Buddies',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Grocery Buddies 1',
      notificationSubject: 'Inside a grocery store?',
      notificationText: 'Share an experience with others who are also grocery shopping',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.grocery),
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
  halfhalf_bar_knowsDTR: {
    _id: Random.id(),
    name: 'Cheers',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Cheers 1',
      notificationSubject: 'Drinking at a bar?',
      notificationText: 'Share an experience with others who are also drinking at a bar',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.bar),
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
  halfhalf_religious_knowsDTR: {
    _id: Random.id(),
    name: 'Religious Architecture',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Religious Architecture 1',
      notificationSubject: 'Visiting a place of worship?',
      notificationText: 'Share an experience with others who are also visiting a place of worship',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.castle),
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
  halfhalf_sunset_knowsDTR: {
    _id: Random.id(),
    name: 'Sunset Together',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Sunset Together 1',
      notificationSubject: 'Can you see the sunset?',
      notificationText: 'Share an experience with others who are also watching the sunset',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.sunset),
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
  halfhalf_asian_knowsDTR: {
    _id: Random.id(),
    name: 'Eating with Chopsticks',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Eating with Chopsticks 1',
      notificationSubject: 'Eating at an asian restaurant?',
      notificationText: 'Share an experience with others who are also eating asian food',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.eating_with_chopsticks),
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
  halfhalf_books_knowsDTR: {
    _id: Random.id(),
    name: 'Book Buddies',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Book Buddies 1',
      notificationSubject: 'Are you at a library?',
      notificationText: 'Share an experience with others who are also at the library',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.library),
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
  halfhalf_leakmask_knowsDTR: {
    _id: Random.id(),
    name: 'Leaf Mask',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Leaf Mask 1',
      notificationSubject: 'Are you at a park?',
      notificationText: 'Share an experience with others who are also at a park',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.forest),
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
  halfhalf_puddles_knowsDTR: {
    _id: Random.id(),
    name: 'Puddle Feet',
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: 'Puddle Feet 1',
      notificationSubject: 'Are you outside while its raining?',
      notificationText: 'Share an experience with others who are enjoying or enduring the rain',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.rainy),
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
  halfhalf_coffeesideoflaughs_knowsDTR: {
    _id: Random.id(),
    name: "Coffee with a side of Laughs",
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      // needName MUST have structure "My Need Name XYZ"
      needName: "Coffee with a side of Laughs 1",
      notificationSubject: 'Inside a coffee shop?',
      notificationText: 'Share an experience with others who are also at a coffee shop',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.coffee), // any place that has cups (cafes + bars + restaurants)
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
  halfhalf_bigbites_knowsDTR: {
    _id: Random.id(),
    name: "Big Bites",
    group: 'DTR',
    participateTemplate: 'halfhalfParticipate',
    resultsTemplate: 'halfhalfResults',
    contributionTypes: addStaticAffordanceToNeeds('knowsDTR', [{
      needName: "Big Bites 1", // Any restaurant that would serve something you'd eat with your hands (burrito, tacos, hotdogs, sandwiches, wraps, burgers, tradamerican, newamerican )
      notificationSubject: 'Eating at a restaurant?',
      notificationText: 'Share an experience with others who are enjoying big bites of their meal',
      situation: {
        detector: getDetectorUniqueKey(DETECTORS.big_bite_restaurant),
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

let CHI20_Olin_EXPERIENCES =  {
  storytime_knowsOlin: createStorytimeImproved('Olin', 1), // version 1 starts with bars
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
        detector: getDetectorUniqueKey(DETECTORS.sunny),
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
        detector: getDetectorUniqueKey(DETECTORS.grocery),
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
        detector: getDetectorUniqueKey(DETECTORS.bar),
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
        detector: getDetectorUniqueKey(DETECTORS.castle),
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
        detector: getDetectorUniqueKey(DETECTORS.sunset),
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
        detector: getDetectorUniqueKey(DETECTORS.eating_with_chopsticks),
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
        detector: getDetectorUniqueKey(DETECTORS.library),
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
        detector: getDetectorUniqueKey(DETECTORS.forest),
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
        detector: getDetectorUniqueKey(DETECTORS.rainy),
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
        detector: getDetectorUniqueKey(DETECTORS.coffee), // any place that has cups (cafes + bars + restaurants)
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
        detector: getDetectorUniqueKey(DETECTORS.big_bite_restaurant),
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

export const CONSTANTS = {
  'LOCATIONS': LOCATIONS,
  'USERS': USERS,
  // Comment out if you would like to only test specific experiences
  // 'EXPERIENCES': (({ halfhalfEmbodiedMimicry }) => ({ halfhalfEmbodiedMimicry }))(EXPERIENCES),
  'EXPERIENCES': Object.assign({}, EXPERIENCES, CHI20_DTR_EXPERIENCES, CHI20_Olin_EXPERIENCES),
  // 'EXPERIENCES': CHI20_DTR_EXPERIENCES,
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
