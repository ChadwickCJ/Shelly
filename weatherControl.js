// This switches a device on or off based on % cloud cover between two time periods.
// The cache expires time from AccuWeather is used to prevent requesting data before the next refresh.
// CONFIG.startTime is overwritten with this value to provide the control.

let CONFIG = {
  accuWeatherURL: "http://dataservice.accuweather.com/",
  accuWeatherAPIKey: "--- You need your own key from AccuWeather ---",
  currentURL: "currentconditions/v1/",
  cityKey: "49908_PC",
  getInterval: 1 * 60 * 1000, //1 minute as milliseconds
  repeat: true,
  deviceId: 0,
  cloudMinimum: 5,
  startDefault: 1145,
  startTime: 1145,
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
                 print("Did it still work", CONFIG.startTime);
               } else{
                 print(deviceTime, "is not the time.")
               }
              },
              null
  );
}

function convertString(theString) {
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
                let expiresTs = result.headers["Expires"];
                let expiresTm = expiresTs.slice(expiresTs.length - 12, expiresTs.length - 7);
                print("Cache expires time:", expiresTs, expiresTm);
                CONFIG.startTime = convertString(expiresTm) + 101; //Add 1 hour for GMT and round up minutes
                print("Did it work", CONFIG.startTime, convertString(expiresTm))
                print(currentWeather[0].LocalObservationDateTime);
                print(currentWeather[0].CloudCover, "%");
                if (currentWeather[0].CloudCover < CONFIG.cloudMinimum) {
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

function TimeZone() {
  Shelly.call("Shelly.GetConfig",
              {id: IdNum},
              function (result)
              {
               let tZ= convertString(JSON.parse(JSON.stringify(result.location)).tz);
              },
              tZ
  );
}

function switchMode(mode) {
  Shelly.call("Switch.set", {'id': CONFIG.deviceId, 'on': mode});
}

Timer.set(CONFIG.getInterval,CONFIG.repeat,deviceStatus,CONFIG.deviceId);
