//sends a chat message to the specified room
function sendChatMessage()
{
  //get message, username and roomid
  var username = window.user;
  var roomid = window.roomid+'';
  var message = $('#chatInput').val();

  //validate message length
  if(checkUserInput(user) && checkUserInput(message) && message.length < 251)
  {
    //send message
    var dataToSend = {service:'chat',method:'sendChatMessage',data:{user:username,message:message,roomid:roomid}};

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
          updateUserMessage(returnedData.errormessage);
        } else {
          console.log('chat message sent');
        }
      },
      error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
        //show error message
        updateUserMessage('error sending chat request');
      }
    });
  } else {
    //validation failed, update user message
    updateUserMessage('Please enter a chat message, max length 250 characters.');
  }
}


//gets the last chat message from the db for the given room,
//if the room is empty it will create a new one
function getChatMessage()
{
  //get username and roomid
  var user = window.user;
  var roomid = window.roomid+'';

  //get last message from server
  var dataToSend = {service:'chat',method:'getChatMessage',data:{user:user,roomid:roomid}};

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
        updateUserMessage(returnedData.errormessage);
      } else {
        //add chat message to chat window
        appendChatMessage(returnedData.user, returnedData.message);
      }
    },
    error: function( jqXhr, textStatus, errorThrown ){
      console.log( errorThrown );
      //show error message
      updateUserMessage('error sending chat request');
    }
  });
}


//adds the last chat message to the chat list
function appendChatMessage(user, message)
{
  //check if last chat message matches current
  if(window.chatLastMessage !== user+message)
  {
    window.chatLastMessage = user+message;
    $('#chatRoom').append('<li>'+user+': '+message+'</li>');
  }
}


//clears chat window
function clearChat()
{
  $('#chatRoom').html('');
}


function updateUserMessage(message)
{
  $('#statusMessage').text(message);
}


//update chat every 2 seconds, called after a user logs in
function monitorChat() {
  window.setInterval(function(){
    getChatMessage();
  }, 2000);
}



//gets active users
function getActiveUsers() {

}
