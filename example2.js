// Example 2 to force synchronous code execution with a timer.
//------------------------------------------------------------

let CONFIG = {
  iAmDone: false,
  timeZone: "Missing",
};

Shelly.call("Shelly.GetConfig", {id: 0},
            function (result) {
              CONFIG.iAmDone = true;
              print("In Shelly.GetConfig:", CONFIG.timeZone)
              CONFIG.timeZone = JSON.parse(JSON.stringify(result.sys)).location.tz;
              print("Computed timeZone:", CONFIG.timeZone)
            },
            null
);

function main() {
if (CONFIG.iAmDone) {
  print("Answer from call function:", CONFIG.timeZone);
  CONFIG.iAmDone = false;
  Timer.clear(timer_handle);
} else {
  print("Failed :-(");
};
}

// 100ms will work, 25ms is to loop through main() a few times.
let timer_handle = Timer.set(25, true, main);
