import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { log, serverLog } from '../../api/logs.js';
////import { LocationManager } from '../../api/locations/client/location-manager-client.js';

///Example location object returned
// {
//     "timestamp":     [Date],     // <-- Javascript Date instance
//     "is_moving":     [Boolean],  // <-- The motion-state when location was recorded.
//     "uuid":          [String],   // <-- Universally unique identifier
//     "coords": {
//         "latitude":  [Float],
//         "longitude": [Float],
//         "accuracy":  [Float],
//         "speed":     [Float],
//         "heading":   [Float],
//         "altitude":  [Float]
//     },
//     "activity": {
//         "type": [still|on_foot|walking|running|in_vehicle|on_bicycle],
//         "confidence": [0-100%]
//     },
//     "battery": {
//         "level": [Float],
//         "is_charging": [Boolean]
//     }
// }

if (Meteor.isCordova) {
  Meteor.startup(() => {
    //Configure Plugin
    var bgGeo = window.BackgroundGeolocation;

    //This callback will be executed every time a geolocation is recorded in the background.
    var callbackFn = function(location) {
      console.log('- Location: ', JSON.stringify(location));

      if (Meteor.userId()) {
        HTTP.post(`${ Meteor.absoluteUrl() }api/geolocation`, {
          data: {
            location: location,
            userId: Meteor.userId()
          }
        }, (err, res) => {
          console.log("Error with client/location-tracking sending location update to server")
        });
      }
    };

    var failureFn = function(errorCode) {
       console.warn('- BackgroundGeoLocation error: ', errorCode);
     }

    // Listen to location events & errors.
    bgGeo.on('location', callbackFn, failureFn);
    // Fired whenever state changes from moving->stationary or vice-versa.
    bgGeo.on('motionchange', function(isMoving) {
      console.log('- onMotionChange: ', isMoving);
    });

    // Fired whenever an HTTP response is received from your server.
    bgGeo.on('http', function(response) {
      console.log('http success: ', response.responseText);
    }, function(response) {
      console.log('http failure: ', response.status);
    });


    bgGeo.configure({
            // Geolocation config
            desiredAccuracy: 0,
            distanceFilter: 10,
            stationaryRadius: 25,
            // Activity Recognition config
            activityRecognitionInterval: 10000,
            stopTimeout: 5,
            // Application config
            debug: false,  // <-- Debug sounds & notifications.
            stopOnTerminate: false,
            startOnBoot: true,
            // HTTP / SQLite config
            //url: "http://your.server.com/locations",
            method: "POST",
            autoSync: true,
            maxDaysToPersist: 3,
            // headers: {  // <-- Optional HTTP headers
            //     "X-FOO": "bar"
            // },
            // params: {   // <-- Optional HTTP params
            //     "auth_token": "maybe_your_server_authenticates_via_token_YES?"
            // }
        }, function(state) {
            // This callback is executed when the plugin  is ready to use.
            console.log("BackgroundGeolocation ready: ", state);
            if (!state.enabled) {
                bgGeo.start();
            }
        });

    bgGeo.start();
  });
} else {
}
