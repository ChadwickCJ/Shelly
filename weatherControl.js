// This switches a device on or off based on % cloud cover between two time periods.
// The cache expires time from AccuWeather is used to prevent requesting data before the next forecast is due.
// CONFIG.startTime is overwritten with this value to provide the control.

let CONFIG = {
  accuWeatherAPIKey: "--- You need your own key from AccuWeather ---",
  accuWeatherURL: "http://dataservice.accuweather.com/",
  currentURL: "currentconditions/v1/",
  cityKey: "49908_PC",
  getInterval: 1 * 60 * 1000, //1 minute as milliseconds
  repeat: true,
  deviceId: 0,
  cloudMinimum: 20,
  startDefault: 1100,
  startTime: 1100,
  stopTime: 1400
};

function deviceStatus(IdNum) {
  Shelly.call("Shelly.GetStatus",
              {id: IdNum},
              function (result)
              {
               let deviceTime = convertString(JSON.parse(JSON.stringify(result.sys)).time);
               if (isItTime(deviceTime)) {
                 print("Time for cloud check!")
                 getClouds();
               //print("Did it still work", CONFIG.startTime);
               } else{
                 print(deviceTime, "is not the time.")
               }
              },
              null
  );
}

function convertString(theString) {
//print("theString", JSON.stringify(theString));
  let allNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let stringTheory = "";
  for (let i = 0; i < theString.length; i++) {
    if (theString[i] === allNumbers[theString[i]]) {
      stringTheory += theString[i];
    }
  }
  if (stringTheory !== "") {
    let objectString = "{\"myNum\":" + stringTheory + "}";
    return JSON.parse(objectString).myNum;
  } else {
    return null;
  };
}

function isItTime(thisTime) {
  print("Start time is:", CONFIG.startTime)
  if (thisTime > CONFIG.stopTime) {
    CONFIG.startTime = CONFIG.startDefault;
    switchMode(false);
  }
  return (thisTime >= CONFIG.startTime && thisTime <= CONFIG.stopTime);
}

function getClouds() {
  Shelly.call("http.get", 
             {url:CONFIG.accuWeatherURL + CONFIG.currentURL + CONFIG.cityKey +
                  "?apikey=" + CONFIG.accuWeatherAPIKey + "&language=EN-GB&details=true"},
              function (result) {
              let currentWeather = JSON.parse(result.body);
              if (currentWeather.Code !== "ServiceUnavailable") {
                let expiresTs = result.headers.Expires;
                let expiresTm = convertString(expiresTs.slice(expiresTs.length - 12, expiresTs.length - 7));
                let localODT = currentWeather[0].LocalObservationDateTime;
                let timeOffset = convertString(localODT.slice(localODT.length - 5, localODT.length));
                CONFIG.startTime = expiresTm + timeOffset + 1; //Add GMT offset and round up minutes
                print("Cache expires time:", expiresTs);
                print("Did it work", CONFIG.startTime, expiresTm)
                print(localODT, currentWeather[0].CloudCover, "%");
                if (currentWeather[0].CloudCover <= CONFIG.cloudMinimum) {
                  switchMode(true);
                } else {
                  switchMode(false);
                };
              } else {
                print(currentWeather.Message);
              }
              },
              CONFIG.startTime
  );
}

function switchMode(mode) {
  Shelly.call("Switch.set", {'id': CONFIG.deviceId, 'on': mode});
}

Timer.set(CONFIG.getInterval,CONFIG.repeat,deviceStatus,CONFIG.deviceId);
