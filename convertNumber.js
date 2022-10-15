// Converts a number into a string.
//---------------------------------

function convertNumber(theNumber) {
  let roundingAdjustment = 0.000000000000001;
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
  
  //Impact of rounding adjustment; computed value is 2.999999999999999375, not 3:
  //print((Math.log(1000) / Math.log(10)),
  //      (Math.log(1000) / Math.log(10) + roundingAdjustment));
  //print((Math.floor(Math.log(1000) / Math.log(10))),
  //      (Math.floor(Math.log(1000) / Math.log(10) + roundingAdjustment)));

  base10Log = (Math.log(theNumber) / Math.log(10)) + roundingAdjustment;
  numberOfDigits = Math.floor(base10Log) + 1;
  
  for (let i = numberOfDigits - 1; i > -1; i--) {
    singleDigit = Math.floor(theNumber / Math.pow(10, i));
    stringTheory += allNumbers[singleDigit];
    theNumber = theNumber - (singleDigit * Math.pow(10, i));
  }
  
  return (sign + stringTheory);
}

print(convertNumber(0));
print(convertNumber(1), convertNumber(-1), convertNumber(9), convertNumber(-9));
print(convertNumber(10), convertNumber(-10), convertNumber(99), convertNumber(-99));
print(convertNumber(100), convertNumber(-100), convertNumber(999), convertNumber(-999));
print(convertNumber(1000), convertNumber(-1000), convertNumber(9999), convertNumber(-9999));
print(convertNumber(1234567890));
