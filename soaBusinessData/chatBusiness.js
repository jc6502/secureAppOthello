//connection to the user service


//exposed methods

//gets a chat message and updates the chat room
exports.receiveChatMessage = function(conn, req, res) {
  //sanitize user input
  var username = req.sanitize(req.body.data.user);
  var message = req.sanitize(req.body.data.message);
  var chatRoom = req.sanitize(req.body.data.roomid);
  var time = new Date().toISOString().slice(0, 19).replace('T', ' '); //time in ISO DATETIME format for sql

  //check if chat message or username is over length

  //checks chat room is already created
  //mysql package sanitizes input for prepared statements
  var sql = 'SELECT id FROM chattable WHERE id = ?';
  conn.query(sql, [chatRoom], function (error, result, fields) {
    if (error) throw error;

    //checks if chat room has already been created
    if (result.length > 0)
    {
      //chat room exists
      var sql = 'UPDATE chattable  SET lastUser = ?, lastMessage = ?, lastActive = ? WHERE id = ?';
      conn.query(sql, [username, message, time, chatRoom], function (error, result, fields) {
        if (error) throw error;

        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({message:'chat updated'}));
        res.end();
      });

    }
  });
}//end receiveChatMessage



//sends back the last chat message for a chat room
exports.getChatMessage = function(conn, req, res) {
  //get and sanitize user input
  var username = req.sanitize(req.body.data.user);
  var chatRoom = req.sanitize(req.body.data.roomid);

  //if chat is not room 0, verify user using user verification method

    //get last chat message
    var sql = 'SELECT * FROM chattable WHERE id = ?';
    var query = conn.query(sql, [chatRoom], function (error, result, fields) {
      if (error) throw error;

      //checks if chat room has already been created
      if (result.length > 0)
      {
        //chat room exists, send data
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({message:result[0].lastMessage, user:result[0].lastUser}));
        res.end();

      } else {
        //create chat room
        console.log('adding chat room');
        var time = new Date().toISOString().slice(0, 19).replace('T', ' '); //time in ISO DATETIME format for sql
        var sql = 'INSERT INTO chattable (id, lastUser, lastMessage, lastActive) VALUES (?, ?, ?, ?)';
        conn.query(sql, [chatRoom, 'chatbot', 'start chatting!', time], function (error, result, fields) {
          if (error) throw error;

          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({message:'start chatting!', user:'chatbot'}));
          res.end();
        });
      }
    });

}//end getChatMessage



//local methods
function testLocal(){
  return 'local test';
}
