//exposed methods

//creates a new user
exports.createNewUserBusiness = function(conn, req, res) {
  //sanitize user input
  var username = req.sanitize(req.body.data.user);
  var password = req.sanitize(req.body.data.pass);
  var roomid = 0;

  //create user or send error message
  //mysql package sanitizes input for prepared statements
  conn.query('SELECT username FROM usertable WHERE username = ?', [username], function (error, result, fields) {
    if (error) throw error;

    //check availability
    if (result.length > 0)
    {
      //username already taken
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({errormessage:'Username already taken'}));
      res.end();
    } else {
      //create new user
      var sql = 'INSERT INTO usertable (username, password, active, lastActive) VALUES (?,?,?,?)';
      var currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      console.log('new user: '+username+' '+password+' 1 '+currentTime + ' 0');
      conn.query(sql, [username, password, 1, currentTime], function (error, results, fields) {
        if (error) throw error;

        //send success message
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({message:'true',username:username,roomid:roomid}));
        res.end();
      });
    }

  });
}//end createNewUserBusiness



//login a user
exports.loginUserBusiness = function(conn, req, res) {
  //sanitize user input
  var username = req.sanitize(req.body.data.user);
  var password = req.sanitize(req.body.data.pass);
  var roomid = 0;

  //create user or send error message
  //mysql package sanitizes input for prepared statements
  var sql = 'SELECT username FROM usertable WHERE username = ? AND password = ?';
  conn.query(sql, [username, password], function (error, result, fields) {
    if (error) throw error;

    //checks username and password combination exists
    if (result.length > 0)
    {
      //send success message
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({message:'true',username:username,roomid:roomid}));
      res.end();
    } else {
      //failed login
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({errormessage:'username and/or password incorrect'}));
      res.end();
    }

  });
},//end loginUserBusiness

//sets the current room of a user
exports.roomState = function(conn, data)
{
  //get username and room number
  var user = data.user;
  var roomid = data.roomid; //if -1, calls the get, otherwise sets the room id

  console.log('user : %s, roomid : %s',user,roomid);

  //set given roomid
  var sql = 'UPDATE usertable SET roomid = ? WHERE username = ?';
  conn.query(sql, [roomid, user], function (error, result, fields) {
    if (error) throw error;
    return true;
  });
}//end roomstate


//given a modified ISO datetime string, update the given user's last seen time
exports.updateLastSeen = function(conn, time, user) {
  var sql = 'UPDATE usertable SET lastActive = ? WHERE username = ?';
  conn.query(sql, [time, user], function (error, result, fields) {
    if (error) throw error;
    return true;
  });
}//end updateLastSeen
