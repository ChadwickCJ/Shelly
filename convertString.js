// Strips non-numeric characters from a string to return a number.

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

print(convertString("x1we1:23zzz"));
print(convertString("10034fwsrf346ue5y0"));
print(convertString("qwerty"));
