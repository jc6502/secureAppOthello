//used to login the client

//creates onclick handlers so the user can switch beteen new user and login
$(document).ready(function() {
  $('#loginSwitchToNewUserButton').click(function() {
    $('#loginSection').addClass('hidden');
    $('#newUserSection').removeClass('hidden');
  });
  $('#newUserSwitchToLoginButton').click(function() {
    $('#newUserSection').addClass('hidden');
    $('#loginSection').removeClass('hidden');
  });
});

//sends the ajax call to create a new user, returns a user and game id
function sendNewUser() {
  //clear past error
  hideLoginErrorMessage();

  //get user/pass
  var username = $('#newUserName').val();
  var password = $('#newUserPass').val();
  console.log('sendNewUser() user: %s | pass: %s',username,password);

  //check input
  if(checkUserInput(username) && checkUserInput(password))
  {
    var dataToSend = {service:'user',method:'newUser',data:{user:username,pass:password}};
    console.dir(dataToSend);

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
            addLoginErrorMessage(returnedData.errormessage);
          } else {
            //hide login
            hideLoginSection();
            //set username
            window.user = returnedData.username;
            window.roomid = returnedData.roomid;
          }
      },
      error: function( jqXhr, textStatus, errorThrown ){
          console.log( errorThrown );
          //show error message
          addLoginErrorMessage('error sending new user request');
      }
    });
  } else {
    addLoginErrorMessage('please enter a username and password');
  }
}



//sends the login data, returns a user and game id if successful
function sendLogin() {
  //clear past error
  hideLoginErrorMessage();

  //get user/pass
  var username = $('#loginUserName').val();
  var password = $('#loginUserPass').val();
  console.log('sendLogin() user: %s | pass: %s',username,password);

  //check input
  if(checkUserInput(username) && checkUserInput(password))
  {
    var dataToSend = {service:'user',method:'loginUser',data:{user:username,pass:password}};
    console.dir(dataToSend);

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
            addLoginErrorMessage(returnedData.errormessage);
          } else {
            //hide login
            hideLoginSection();
            //set username and roomid
            window.user = returnedData.username;
            window.roomid = returnedData.roomid;

            //DEBUG
            $('#userid').text('userid: '+window.user);
          }
      },
      error: function( jqXhr, textStatus, errorThrown ){
          console.log( errorThrown );
          //show error message
          addLoginErrorMessage('error sending login request');
      }
    });
  } else {
    //user validation failed
    addLoginErrorMessage('please enter a username and password');
  }
}



//adds a login message for errors
function addLoginErrorMessage(message)
{
  $('#loginErrorMessage').text(message);
  $('#loginErrorMessage').show();
}

//hides the login error message
function hideLoginErrorMessage(message)
{
  $('#loginErrorMessage').hide();
}



//hides the login section
function hideLoginSection()
{
  //hide log, show root window
  $('#userLogin').hide();
  $('#root').show();

  //start monitoring chat
  monitorChat();

  //start monitoring user room state
  monitorRoom();
}
