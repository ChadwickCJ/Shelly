// Example 2 to force synchronous code execution with a timer.
// Also wondering how "userdata" can be used to pass data from
// the invoker to the callback function.
//------------------------------------------------------------

let CONFIG = {
  iAmDone: false,
  timer_handle: null,
  timeZone: "Missing",
};

Shelly.call("Shelly.GetConfig", {id: 0},
            function (result, error_code, error_message, userdata) {
              CONFIG.iAmDone = true;
              print(userdata, CONFIG.timeZone)
              CONFIG.timeZone = JSON.parse(JSON.stringify(result.sys)).location.tz;
              print("Computed timeZone:", CONFIG.timeZone)
            },
            "In Shelly.GetConfig:"
);

function main() {
if (CONFIG.iAmDone) {
  print("Answer from call function:", CONFIG.timeZone);
  CONFIG.iAmDone = false;
  Timer.clear(CONFIG.timer_handle);
} else {
  print("Failed!");
};
}

// 100ms will avoid else processing, 25ms is to loop through main() a few times.
CONFIG.timer_handle = Timer.set(25, true, main);
