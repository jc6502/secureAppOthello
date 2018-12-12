//saves the game board for future reference
var gameboard;

function createBoard(){
  gameboard = new Board(document.getElementById('gamesvg'));
  gameboard.create();
}

$(document).ready(function() {
  createBoard();
});

function sendChallenge()
{
  //get data
  var username = window.user;
  var challengeuser = 'test2';


  var dataToSend = {service:'game',method:'sendChallenge',data:{user:username,challengeuser:challengeuser}};
  $.ajax({
    type: "POST",
    url: SERVERADR,
    data: JSON.stringify(dataToSend),
    dataType: 'json',
    contentType: 'application/json',
    success: function( returnedData, textStatus, jQxhr ){
        if(returnedData.hasOwnProperty('errormessage'))
        {
          //show error message
          addErrorMessage(returnedData.errormessage);
        } else {
          console.dir(returnedData);
        }
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
        //show error message
        addErrorMessage('error sending challenge request');
    }
  });
}//end sendChallenge




function acceptChallenge()
{
  //get data
  var username = window.user;

  var dataToSend = {service:'game',method:'acceptChallenge',data:{user:username}};
  $.ajax({
    type: "POST",
    url: SERVERADR,
    data: JSON.stringify(dataToSend),
    dataType: 'json',
    contentType: 'application/json',
    success: function( returnedData, textStatus, jQxhr ){
        console.log('challenge accepted');
        //hide challenge prompt
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
        //show error message
        addErrorMessage('error sending challenge request');
    }
  });
}//end acceptChallenge


function showUsersOrGame()
{
  if(true)
  {

  } else {

  }
}




//adds a login message for errors
function addErrorMessage(message)
{
  $('#errorMessage').text(message);
  $('#errorMessage').show();
}

//hides the login error message
function hideErrorMessage()
{
  $('#errorMessage').hide();
}
