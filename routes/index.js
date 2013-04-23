// Configuration
var USER_ACCESS_TOKEN = 'ENTER_YOUR_API_ACCESS_TOKEN';  // 'API Access Token' from https://a.ninja.is/hacking
var LAMP_GUID         = '1012BB013169_02_0_1008'; // inspect API call from dashboard - https://a.ninja.is/home
var EYES_GUID         = '1012BB013169_0_0_1007'; // inspect API call from dashboard - https://a.ninja.is/home

var button = "110111010101110000110000";
var door   = "111101010001010101010000";

var WEBCAM = 'http://ENTER_YOUR_IP/snapshot.cgi?user=admin&pwd='; // webcam snapshot URL
var DROPBOX_PATH = '/ENTER/YOUR/PATH/TO/DROPBOX/'; // dropbox folder path on your local filesystem

// Instantiate a new ninja app
var ninjaBlocks = require('ninja-blocks');
// Use the API Access Token from https://a.ninja.is/hacking
var ninja = ninjaBlocks.app({user_access_token:USER_ACCESS_TOKEN});

// Create a container for these devices
var DEVICES = {};

// When we start up we fetch all of a users' devices.
// This is so we don't have to fetch them on every Ninja callback.
// Unfortunately it requires the app to be restarted to pull new devices.
// You can put this into a setInterval to avoid this.
ninja.devices(function(err,devices) {
  DEVICES = devices;
});

function grabimage(type) {
  var fs = require('fs'),
      request = require('request'),
      type = type || "unknown";

  var download = function(uri, filename){
      request(uri).pipe(fs.createWriteStream(filename));
  };

  download(WEBCAM, DROPBOX_PATH+'camera_'+type+'_'+(new Date()).getTime()+'.jpg');
}

function lamp(color) {
  ninja.devices({ device_type:'rf433' },function(err,data){
    // console.log(data);
    if(color == "ff0000") {
      ninja.device(LAMP_GUID).actuate('{"on":true,"hue":0,"bri":254,"sat":254,"alert": "lselect"}',function(err) {
      if (err) {
        console.error(err);
        return;
      }
    });
    } else {
      ninja.device(LAMP_GUID).actuate('{"on":true,"hue":46920,"bri":254,"sat":144,"alert": "select"}',function(err) {
      if (err) {
        console.error(err);
        return;
      }
    });
    }
  });
}

function eyes(color) {
  ninja.devices({ device_type:'rgbled' },function(err,data){
    ninja.device(EYES_GUID).actuate(color, function(err) {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
}

/*
 * Handle the callback from the Ninja platform
 */
exports.handleNinjaCallback = function(req, res){

  console.log('Received %s from %s at %s',req.body.DA,req.body.GUID,(new Date()).toLocaleString());

  if(req.body.DA == button) {
    console.log("~~ BUTTON ~~");
    //console.log(req.body);
    grabimage("button");
    eyes("0000ff");
    lamp("0000ff");
  } else if (req.body.DA == door) {
    console.log("~~ DOOR ~~");
    //console.log(req.body);
    grabimage("door");
    eyes("ff0000");
    lamp("ff0000");
  } else {
    console.log("-- unknown device --");
  }

  // Very important to end the response.
  res.end();
};