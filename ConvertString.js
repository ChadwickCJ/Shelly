//Shelly.GetStatus returns multiple objects:
//ws, wifi, sys, switch:0, script:n (depending on the number of scripts), mqtt, input:0, cloud, and ble.
//This example retrieves "sys", which contains the time of the system.

function DeviceStatus() {
Shelly.call("Shelly.GetStatus",
            {id: 0},
            function (result, error_code, error_message, userdata)
            {
//           print(JSON.stringify(result));
//           print(JSON.parse(JSON.stringify(result.sys)).time);
             let SysStatus = JSON.stringify(result.sys);
             let SysInfo   = JSON.parse(SysStatus);
             let SysTime   = SysInfo.time;
//           print (typeof SysStatus, typeof SysInfo, typeof SysTime);
             SetTime(SysTime);
            },
            null
);
}

function SetTime(MyTime) {
let substr1 = MyTime.slice(0, 2);
let substr2 = MyTime.slice(3, MyTime.length);
let ObjectString = "{" + chr(34) + "TimeNum" + chr(34) + ":" + substr1 + substr2 + "}";
//print(ObjectString);
let TimeObj = JSON.parse(ObjectString);
print (MyTime, typeof MyTime, TimeObj.TimeNum, typeof TimeObj.TimeNum);
}

DeviceStatus();
