// Example to show code execution sequence with a timer.
//------------------------------------------------------

let CONFIG = {
  getInterval: 10 * 1000,
  repeat: true,
  deviceTime: 0,
  sunRiseTm: 813,
  sunSetTm: 1730
};

function powerControl() {
  print("In powerControl");
  deviceTime();
  if (CONFIG.deviceTime >= CONFIG.sunRiseTm && CONFIG.deviceTime <= CONFIG.sunSetTm) {
    print("The end is nigh!");
  } else {
    print("Now is not the time:", CONFIG.deviceTime, CONFIG.sunRiseTm, CONFIG.sunSetTm);
  }
}

function deviceTime() {
  print("In deviceTime");
  Shelly.call("Shelly.GetStatus", {id: 0},
              function (result) {
                print("In deviceTime function");
                CONFIG.deviceTime = convertString(JSON.parse(JSON.stringify(result.sys)).time);
                print("The time is:", CONFIG.deviceTime);
              },
              null
  );
}

function convertString(theString){
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

deviceTime();
Timer.set(CONFIG.getInterval, CONFIG.repeat, powerControl);
