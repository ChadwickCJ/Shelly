// Version 3.2 of get solar power. This time, all the Async calls are
// grouped together on a timer, with the main loop on a separate timer.
// Resolved the issue of "switch:0".source being "loopback" for both the
// script and from schedules, so that this script does not turn the switch
// off when switched on by a schedule.
//--------------------------------------------------------------------------

let CONFIG = {
  accuWeatherAPIKey: "=-> You need your own key from AccuWeather <-=",
  accuWeatherURL: "http://dataservice.accuweather.com/",
  oneDay: "forecasts/v1/daily/1day/",
  cityKey: "=-> Here I am! <-=",
  solarURL: "http://=-> Local network IP <-=/status.html",
  auth: {"=-> Chrome PF12 to find this info <-="},
  indexStart: "webdata_now_p",
  indexStop: "webdata_today_e",
  requestResult: false,
  getStatusResult: false,
  getConfigResult: false,
  asyncInterval: 29 * 1000, //Inverter logger reports every 60s, half it and -1 becasue I don't know exactly when.
  mainControlCount: 0,
  mainInterval: 100,
  timeout: 1,
  repeat: true,
  minimumPower: 1300,
  power: 0,
  deviceTime: 0,
  sunRiseTm: 0800,
  sunSetTm: 1700,
  output: false,
  source: "",
  killMain: null,
  oldDeviceName: "Immersion Heater",
  newDeviceName: "",
  scriptDeviceName: "Solar Power"
};

function asyncCalls() {
  CONFIG.requestResult = false;
  CONFIG.getStatusResult = false;
  CONFIG.getConfigResult = false;
  CONFIG.mainControlCount = 0;
  CONFIG.killMain = Timer.set(CONFIG.mainInterval, CONFIG.repeat, main);
  Shelly.call("http.request", {method: "GET",
                               url: CONFIG.solarURL,
                               headers: CONFIG.auth,
                               timeout: CONFIG.timeout},
              function (result, error_code, error_message) {
                CONFIG.requestResult = true;
                if (error_code === 0) {
                  let body = JSON.stringify(result.body);
                  let startPos = body.indexOf(CONFIG.indexStart) + 18;
                  let endPos = body.indexOf(CONFIG.indexStop) - 11;
                  CONFIG.power = convertString(body.slice(startPos, endPos));
                  if (CONFIG.power === null) {
                    print(JSON.stringify(result));
                  }
                } else {
                  CONFIG.power = 0;
                  if (error_code !== -104) {
                    print("Error:", error_code, "Message:", error_message);
                  }
                }
              },
              null
  );
  Shelly.call("Shelly.GetStatus", {id: 0},
              function (result, error_code, error_message) {
                CONFIG.getStatusResult = true;
                if (error_code === 0) {
                  CONFIG.deviceTime = convertString(JSON.parse(JSON.stringify(result.sys)).time);
                  CONFIG.output = JSON.parse(JSON.stringify(result["switch:0"])).output;
                  CONFIG.source = JSON.parse(JSON.stringify(result["switch:0"])).source;
                } else {
                  print("Shelly.GetStatus", "Error:", error_code, "Message:", error_message);
                }
              },
              null
  );
  Shelly.call("Switch.GetConfig", {id: 0},
              function (result, error_code, error_message) {
                CONFIG.getConfigResult = true;
                if (error_code === 0) {
                  CONFIG.newDeviceName = JSON.parse(JSON.stringify(result)).name;
                } else {
                  print("Switch.GetConfig", "Error:", error_code, "Message:", error_message);
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

function setName(newName) {
  Shelly.call("Switch.SetConfig", {id: 0, config: {name: newName}},
              function (result, error_code, error_message) {
                if (error_code !== 0) {
                  print("Switch.SetConfig", "Error:", error_code, "Message:", error_message);
                }
              },
              null
  );
}

function switchMode(mode){
  Shelly.call("Switch.set", {'id': 0, 'on': mode},
              function (result, error_code, error_message) {
                if (error_code !== 0) {
                  print("Switch.Set", "Error:", error_code, "Message:", error_message);
                }
              },
              null
  );
}

function sunTimes() {
  Shelly.call("http.get", {
              url:CONFIG.accuWeatherURL + CONFIG.oneDay + CONFIG.cityKey +
                  "?apikey=" + CONFIG.accuWeatherAPIKey + "&language=en-gb&details=true"},
              function (result) {
                if (JSON.parse(result.body).Code !== "ServiceUnavailable") {
                  let dailyForecasts = JSON.parse(result.body).DailyForecasts;
                  let sunRise = dailyForecasts[0].Sun.Rise;
                  let sunSet = dailyForecasts[0].Sun.Set;
                  CONFIG.sunRiseTm = convertString(sunRise.slice(11, 16)) + 100;
                  CONFIG.sunSetTm = convertString(sunSet.slice(11, 16)) - 100;
                  print("Control times:", CONFIG.sunRiseTm, CONFIG.sunSetTm);
                } else {
                  print(JSON.parse(result.body).Message);
                }
              },
              null
  );
}

function main() {
  CONFIG.mainControlCount += 1;
  if (CONFIG.requestResult && CONFIG.getStatusResult && CONFIG.getConfigResult) {
    print("Answer from call functions:", CONFIG.power, CONFIG.deviceTime, CONFIG.newDeviceName);
    Timer.clear(CONFIG.killMain);
    if (CONFIG.deviceTime >= CONFIG.sunRiseTm && CONFIG.deviceTime <= CONFIG.sunSetTm) {
      if (CONFIG.power >= CONFIG.minimumPower) {
        setName(CONFIG.scriptDeviceName);
        switchMode(true);
      } else if (CONFIG.newDeviceName === CONFIG.scriptDeviceName) {
        setName(CONFIG.oldDeviceName);
        switchMode(false);
      }
    } else if (CONFIG.deviceTime === 0200) {
      sunTimes();
    }
  }
  if (CONFIG.mainControlCount > 100) {
    print("Kill main?", CONFIG.mainControlCount);
  }
}

sunTimes();
Timer.set(CONFIG.asyncInterval, CONFIG.repeat, asyncCalls);
