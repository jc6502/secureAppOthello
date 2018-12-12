//asks the db for the current users game state, sets state based parameters
function checkUserRoomState() {
  var dataToSend = {service:'game',method:'checkChallenge',data:{user:window.user}};
  $.ajax({
    type: "POST",
    url: SERVERADR,
    data: JSON.stringify(dataToSend),
    dataType: 'json',
    contentType: 'application/json',
    success: function( returnedData, textStatus, jQxhr ){
      //console.log('check user room state');
      //console.dir(returnedData);

      //given returned properties, set them
      if(returnedData.hasOwnProperty('challenge'))
      {
        addChallenge(returnedData.challenge);
      }

      if(returnedData.hasOwnProperty('turnPlayer'))
      {
        gameboard.currentPlayerTurn = returnedData.turnPlayer;
        //// DEBUG:
        $('#turnPlayer').text('turnPlayer: '+gameboard.currentPlayerTurn);
      }

      if(returnedData.hasOwnProperty('state'))
      {
        gameboard.updateState(returnedData.state);
      }

      if(returnedData.roomid !== window.roomid)
      {
        clearChat();
      }

      window.roomid = returnedData.roomid;

      //// DEBUG:
      $('#roomid').text('roomid: '+window.roomid);
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
        //show error message
        addErrorMessage('error sending room state request');
    }
  });
}//end checkUserRoomState

//monitors chat after login
function monitorRoom() {
  window.setInterval(function(){
    checkUserRoomState();
  }, 2000);
}


//adds a challenge accept prompt for the given user
function addChallenge(challengeuser) {
  //check if a challenge has been appended
  if($('#challengePrompt').is(':empty'))
  {
    $('#challengePrompt').html('<p>'+challengeuser+' has challenged you to a match.</p><button onclick="acceptChallenge();">Accept</button>');
  }
}
