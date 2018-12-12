/*
  Contains shared misc methods
*/

//sends a message or warning to the user
function alertUser(message)
{
  alert(message);
}

//ensures data is not empty, validation is done server side
function checkUserInput(inputString) {
  if(inputString)
  {
    if(inputString === '')
    {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}
