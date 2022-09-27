let CONFIG = {
  GetInterval: 5 * 60 * 1000, //5 minutes as milliseconds
  Repeat: true,
  DeviceId: 0
};

function deviceStatus(IdNum) {
Shelly.call("Shelly.GetStatus",
            {id: IdNum},
            function (result)
            {
             convertString(JSON.parse(JSON.stringify(result.sys)).time);
            },
            null
);
}

function convertString(MyTime) {
let StringTheory = MyTime.slice(0, 2);
StringTheory += MyTime.slice(3, MyTime.length);
let ObjectString = "{\"" + "TimeNum\":"  + StringTheory + "}";
let TimeObj = JSON.parse(ObjectString);
print (MyTime, typeof MyTime, TimeObj.TimeNum, typeof TimeObj.TimeNum);
}

Timer.set(CONFIG.GetInterval,CONFIG.Repeat,deviceStatus,CONFIG.DeviceId);
