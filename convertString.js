// Strips non-numeric characters from a string to return a number, or null.

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

print(convertString("11:23pm"));
print(convertString("fj1sd2:3%J4h5rt~6{sd7*(sd8fv9cd0f)}"));
print(convertString("qwerty"));
print(convertString("Zer0"));
