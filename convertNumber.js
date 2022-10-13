// Converts a number into a string.
//---------------------------------

function convertNumber(theNumber) {
  let roundingError = 0.0000001;
  let allNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let stringTheory = "";
  let sign = "";
  let singleDigit = 0;
  let base10Log = 0;
  let numberOfDigits = 0;
  
  if (theNumber === 0) {
    return "0";
  } else if (theNumber < 0) {
    theNumber *= -1;
    sign = "-";
  }
  
  base10Log = (Math.log(theNumber) / Math.log(10)) + roundingError;
  numberOfDigits = Math.floor(base10Log);
  
  for (let i = numberOfDigits; i > -1; i--) {
    singleDigit = Math.floor(theNumber / Math.pow(10, i));
    stringTheory += allNumbers[singleDigit];
    theNumber = theNumber - (singleDigit * Math.pow(10, i));
  }
  
  return (sign + stringTheory);
}

print(convertNumber(0));
print(convertNumber(-1));
print(convertNumber(123));
print(convertNumber(-56932));
print(convertNumber(335588));
print(convertNumber(1234567890));
