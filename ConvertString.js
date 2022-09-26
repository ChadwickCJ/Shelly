// Shelly.GetStatus returns multiple objects:
// ws, wifi, sys, switch:0, script:n (depending on the number of scripts), mqtt, input:0, cloud, and ble.
// This example retrieves "sys", which contains the time of the system, every 5 minutes. We also pass
// userdata into the Timer.set() callback.

let CONFIG = {
  DeviceId: 0,
  GetInterval: 5 * 60 * 10 //5 minutes as milliseconds
};

function DeviceStatus(IdNum) {
Shelly.call("Shelly.GetStatus",
            {id: IdNum},
            function (result)
            {
             ConvertString(JSON.parse(JSON.stringify(result.sys)).time);
            },
            null
);
}

function ConvertString(MyTime) {
let substr1 = MyTime.slice(0, 2);
let substr2 = MyTime.slice(3, MyTime.length);
let ObjectString = "{" + chr(34) + "TimeNum" + chr(34) + ":" + substr1 + substr2 + "}";
let TimeObj = JSON.parse(ObjectString);
print (MyTime, typeof MyTime, TimeObj.TimeNum, typeof TimeObj.TimeNum);
}

Timer.set(CONFIG.GetInterval,true,DeviceStatus,CONFIG.DeviceId);
