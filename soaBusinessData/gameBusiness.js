//link to other services
var userService = require('../soaServices/userService.js');

//constants
const BOARDLENGTH = 8;
const BOARDHEIGHT = 8;


//exposed methods

exports.sendChallenge = function(conn, req, res) {
  //sanitize user input
  var username = req.sanitize(req.body.data.user);
  var challengeuser = req.sanitize(req.body.data.challengeuser);
  var time = new Date().toISOString().slice(0, 19).replace('T', ' '); //time in ISO DATETIME format for sql

  //create initial state
  var board = Array(BOARDLENGTH);
  for(var i = 0; i<BOARDLENGTH; i++)
  {
    board[i] = new Array(BOARDHEIGHT);
    for(var j = 0; j<board[i].length; j++)
    {
      board[i][j] = 0;
    }
  }

  //set initial pieces
  board[3][3] = 1;
  board[3][4] = 1;
  board[4][3] = 2;
  board[4][4] = 2;

  //create string version of board
  stringifiedBoard = JSON.stringify(board)

  ///*
  var sql = 'INSERT INTO gametable (user1, user2, turnPlayer, state, lastMove) VALUES (?,?,?,?,?)';
  var query = conn.query(sql, [username, challengeuser, username, stringifiedBoard, time], function (error, result, fields) {
    if (error) throw error;

    //send success message
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({message:'true'}));
    res.end();
  });
  //*/
} //end sendChallenge


//updates and returns the user's current roomid
exports.checkChallenge = function(conn, req, res) {
  //get user and check user's current game
  var username = req.sanitize(req.body.data.user);

  //set a flag to check if a response has been sent back
  var responseSent = false;

  //get user's current room
  var data = new Object;
  data.user = username;
  data.roomid = -1;

  //update user's last known time active
  var currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  userService.updateLastSeen(conn, currentTime, username);

  //get users current room
  var sql = 'SELECT roomid FROM usertable WHERE username = ?';
  conn.query(sql, [username], function (error, result, fields) {
    if (error) throw error;
    //console.log('business : %s',result[0].roomid);
    var currentRoomid = result[0].roomid;

    //check for accepted game
    if(!responseSent)
    {
      var sql = 'SELECT * FROM gametable WHERE (user1 = ? OR user2 = ?) AND accepted = "2"';
      var query = conn.query(sql, [username, username], function (error, result, fields) {
        if (error) throw error;

        if(result.length > 0)
        {
          //console.log('active game found');
          //console.dir(result[0])
          //check if current user's roomid matches, if not update their roomid
          if (currentRoomid !== result[0].id)
          {
            data.roomid = result[0].id;
            userService.roomState(conn, data);
          }

          //return roomid
          responseSent = true;
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({message:'true', roomid:result[0].id, turnPlayer:result[0].turnPlayer, state:result[0].state}));
          res.end();
        }
      });
    }//end current game check

    //check for challenge - user that sent the challenge is user1
    if(!responseSent)
    {
      var sql = 'SELECT * FROM gametable WHERE user2 = ? AND accepted = "1"';
      var query = conn.query(sql, [username, username], function (error, result, fields) {
        if (error) throw error;

        if(result.length > 0)
        {
          //console.log('challenge found'+currentRoomid);

          //return roomid
          responseSent = true;
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({message:'true', roomid:currentRoomid, challenge:result[0].user1}));
          res.end();
        }

      });
    }//end challenge check

    //check for ended game
    if(!responseSent)
    {
      var sql = 'SELECT * FROM gametable WHERE (user1 = ? OR user2 = ?) AND accepted = "3"';
      var query = conn.query(sql, [username, username], function (error, result, fields) {
        if (error) throw error;

        if(result.length > 0)
        {
          //console.log('ended game found');
          //check if current user's roomid matches, if so update their roomid
          if (currentRoomid === result[0].id)
          {
            data.roomid = 0; //kick the user back to the lobby
            userService.roomState(conn, data);
          }

          //return roomid
          responseSent = true;
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({message:'true', roomid:0, winner:'test test test'}));
          res.end();
        } else {
          if(!responseSent)
          {
            //console.log('default');
            //user is in the lobby
            //return roomid
            responseSent = true;
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify({message:'true', roomid:0}));
            res.end();
          }
        }
      });
    }//end ended game check
  });//end get current roomid

}//end checkChallenge


//accepts a challenge for a game
exports.acceptChallenge = function(conn, req, res) {
  var username = req.sanitize(req.body.data.user);

  var sql = 'SELECT * FROM gametable WHERE user2 = ? AND accepted = "1"';
  var query = conn.query(sql, [username], function (error, result, fields) {
    if (error) throw error;

    if(result.length > 0)
    {
      //set new roomid
      var roomid = result[0].id;
      var sql = 'UPDATE usertable SET roomid = ? WHERE username = ?';
      var query = conn.query(sql, [roomid, username], function (error, result, fields) {
        if (error) throw error;

        //update game state to started
        var sql = 'UPDATE gametable SET accepted = "2" WHERE id = ?';
        var query = conn.query(sql, [roomid], function (error, result, fields) {
          if (error) throw error;
          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({message:'true'}));
          res.end();
        });
      });
    }

  });
}//end accept challenge


//updates the state of the game or returns false
exports.sendMove = function(conn, req, res) {
  //sanitize user input
  var username = req.sanitize(req.body.data.user);
  var roomid = req.sanitize(req.body.data.roomid);
  var moveCol = req.sanitize(req.body.data.movecol);
  var moveRow = req.sanitize(req.body.data.moverow);

  //change game state or send false for invalid
  //mysql package sanitizes input for prepared statements
  conn.query('SELECT * FROM gametable WHERE id = ?', [roomid], function (error, result, fields) {
    if (error) throw error;

    //check availability
    if (result.length > 0)
    {
      //check if user is not turn player
      if(result[0].turnPlayer !== username)
      {
        //send response
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({errormessage:'not your turn.'}));
        res.end();
      }

      //get board and id from dbms
      var board = JSON.parse(result[0].state);
      var currentGameId = result[0].id;
      console.dir(board);

      //check if user is black or white and get the next players name
      if(result[0].user1 === username)
      {
        var nextPlayer = result[0].user2
        var playerColor = 1; //user that sent the challenge is white
      } else {
        var nextPlayer = result[0].user1
        var playerColor = 2;//user that got the challenge is black
      }

      var validMove = false;

      //check if the space is occupied
      if(board[moveCol][moveRow] !== 0)
      {
        //send response
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({errormessage:'space already taken.'}));
        res.end();
      }

      //check diagnal left
      var continueMovingTopLeft = true;
      var lengthTopLeft = 1;
      var lastPieceColTopLeft = moveCol;
      var lastPieceRowTopLeft = moveRow;
      for(var i = 0; i<BOARDLENGTH; i++)
      {
        if(continueMovingTopLeft)
        {
          //test bounds
          if(moveCol - lengthTopLeft > -1 && moveRow - lengthTopLeft > -1)
          {
            //console.log('currently looked at :'+board[moveCol-lengthTopLeft][moveRow-lengthTopLeft]);

            //if the adjacent piece is the same color, do nothing
            if(lengthTopLeft === 1 && board[moveCol-lengthTopLeft][moveRow-lengthTopLeft] === playerColor)
            {
              continueMovingTopLeft = false;
            }

            //check if current piece is the same color
            if(board[moveCol-lengthTopLeft][moveRow-lengthTopLeft] === playerColor && continueMovingTopLeft)
            {
              lastPieceColTopLeft = moveCol-lengthTopLeft;
              lastPieceRowTopLeft = moveRow-lengthTopLeft;
              continueMovingTopLeft = false;
            }

            lengthTopLeft++;
          } //end bounds test
        }
      }//end check top left
      //console.log('top left : %s, %s',lastPieceColTopLeft,lastPieceRowTopLeft);
      //change the pieces of the board accordingly
      if(moveCol !== lastPieceColTopLeft && moveRow !== lastPieceRowTopLeft)
      {
        for (var i = 0; i<moveCol-lastPieceColTopLeft;i++)
        {
          board[moveCol-i][moveRow-i] = playerColor;
        }
        validMove = true;
      }//end change state top left


      //check top right
      var continueMovingTopRight = true;
      var lengthTopRight = 1;
      var lastPieceColTopRight = moveCol;
      var lastPieceRowTopRight = moveRow;
      for(var i = 0; i<BOARDLENGTH; i++)
      {
        if(continueMovingTopRight)
        {
          //test bounds
          if(moveCol + lengthTopRight < BOARDLENGTH && moveRow - lengthTopRight > -1)
          {
            //console.log('top right looking: %s, %s, %s',moveCol+lengthTopRight,moveRow-lengthTopRight,board[moveCol+lengthTopRight][moveRow-lengthTopRight]);

            //if the adjacent piece is the same color, do nothing
            if(length === 1 && board[moveCol+lengthTopRight][moveRow-lengthTopRight] === playerColor)
            {
              //console.log('adjacent stop');
              continueMovingTopRight = false;
            }

            //check if current piece is the same color
            if(board[moveCol+lengthTopRight][moveRow-lengthTopRight] === playerColor && continueMovingTopRight)
            {
              //console.log('else stop');
              lastPieceColTopRight = moveCol+length;
              lastPieceRowTopRight = moveRow-length;
              continueMovingTopRight = false;
            }

            lengthTopRight++;
          } //end bounds test
        }
      }//end check top right
      //console.log('top right : %s, %s',lastPieceColTopRight,lastPieceRowTopRight);
      //change the pieces of the board accordingly
      if(moveCol !== lastPieceColTopRight && moveRow !== lastPieceRowTopRight)
      {
        for (var i = 0; i<moveCol-lastPieceColTopRight;i++)
        {
          board[moveCol+i][moveRow-i] = playerColor;
        }
        validMove = true;
      }//end change state top right


      //check bottom right
      var continueMovingBottomRight = true;
      var lengthBottomRight = 1;
      var lastPieceColBottomRight = moveCol;
      var lastPieceRowBottomRight = moveRow;
      for(var i = 0; i<BOARDLENGTH; i++)
      {
        if(continueMovingBottomRight)
        {
          //test bounds
          if(moveCol + lengthBottomRight < BOARDLENGTH && moveRow + lengthTopRight > -1)
          {
            //if the adjacent piece is the same color, do nothing
            if(length === 1 && board[moveCol+lengthBottomRight][moveRow-lengthBottomRight] === playerColor)
            {
              //console.log('adjacent stop');
              continueMovingBottomRight = false;
            }

            //check if current piece is the same color
            if(board[moveCol+lengthBottomRight][moveRow-lengthBottomRight] === playerColor && continueMovingBottomRight)
            {
              //console.log('else stop');
              lastPieceColBottomRight = moveCol+length;
              lastPieceRowBottomRight = moveRow-length;
              continueMovingBottomRight = false;
            }

            lengthBottomRight++;
          } //end bounds test
        }
      }//end check bottom right
      //console.log('top right : %s, %s',lastPieceColTopRight,lastPieceRowTopRight);
      //change the pieces of the board accordingly
      if(moveCol !== lastPieceColBottomRight && moveRow !== lastPieceRowBottomRight)
      {
        for (var i = 0; i<moveCol-lastPieceColBottomRight;i++)
        {
          board[moveCol+i][moveRow-i] = playerColor;
        }
        validMove = true;
      }//end change state bottom right



      //check bottom left
      var continueMovingBottomLeft = true;
      var lengthBottomLeft = 1;
      var lastPieceColBottomLeft = moveCol;
      var lastPieceRowBottomLeft = moveRow;
      for(var i = 0; i<BOARDLENGTH; i++)
      {
        if(continueMovingBottomLeft)
        {
          //test bounds
          if(moveCol - lengthBottomLeft > -1 && moveRow + lengthBottomLeft < BOARDLENGTH)
          {
            //if the adjacent piece is the same color, do nothing
            if(length === 1 && board[moveCol+lengthBottomLeft][moveRow-lengthBottomLeft] === playerColor)
            {
              //console.log('adjacent stop');
              continueMovingBottomLeft = false;
            }
            //check if current piece is the same color
            if(board[moveCol+lengthBottomLeft][moveRow-lengthBottomLeft] === playerColor && continueMovingBottomLeft)
            {
              //console.log('else stop');
              lastPieceColBottomLeft = moveCol+lengthBottomLeft;
              lastPieceRowBottomLeft = moveRow-lengthBottomLeft;
              continueMovingBottomLeft = false;
            }

            lengthBottomLeft++;
          } //end bounds test
        }
      }//end check bottom left
      //console.log('top right : %s, %s',lastPieceColTopRight,lastPieceRowTopRight);
      //change the pieces of the board accordingly
      if(moveCol !== lastPieceColBottomLeft && moveRow !== lastPieceRowBottomLeft)
      {
        for (var i = 0; i<moveCol-lastPieceColBottomLeft;i++)
        {
          board[moveCol+i][moveRow+i] = playerColor;
        }
        validMove = true;
      }//end change state bottom left


      //check left
      var continueMovingLeft = true;
      var lengthLeft = 1;
      var lastPieceColLeft = moveCol;
      var lastPieceRowLeft = moveRow;
      for(var i = 0; i<BOARDLENGTH; i++)
      {
        if(continueMovingLeft)
        {
          //test bounds
          if(moveCol - lengthLeft > -1)
          {
            //if the adjacent piece is the same color, do nothing
            if(lengthLeft === 1 && board[moveCol-lengthLeft][moveRow] === playerColor)
            {
              //console.log('adjacent stop');
              continueMovingLeft = false;
            }
            //check if current piece is the same color
            if(board[moveCol-lengthLeft][moveRow] === playerColor && continueMovingLeft)
            {
              //console.log('else stop');
              lastPieceColLeft = moveCol+lengthLeft;
              lastPieceRowLeft = moveRow;
              continueMovingLeft = false;
            }

            lengthLeft++;
          } //end bounds test
        }
      }//end check left
      //console.log('top right : %s, %s',lastPieceColTopRight,lastPieceRowTopRight);
      //change the pieces of the board accordingly
      if(moveCol !== lastPieceColLeft)
      {
        for (var i = 0; i<lastPieceColLeft-moveCol;i++)
        {
          board[moveCol-i][moveRow] = playerColor;
        }
        validMove = true;
      }//end change state left


      //check right
      var continueMovingRight = true;
      var lengthRight = 1;
      var lastPieceColRight = moveCol;
      var lastPieceRowRight = moveRow;
      for(var i = 0; i<BOARDLENGTH; i++)
      {
        if(continueMovingRight)
        {
          //test bounds
          if(moveCol + lengthRight < BOARDLENGTH)
          {
            //if the adjacent piece is the same color, do nothing
            if(length === 1 && board[moveCol+lengthRight][moveRow] === playerColor)
            {
              //console.log('adjacent stop');
              continueMovingRight = false;
            }
            //check if current piece is the same color
            if(board[moveCol+lengthRight][moveRow] === playerColor && continueMovingRight)
            {
              //console.log('else stop');
              lastPieceColRight = moveCol+lengthRight;
              lastPieceRowRight = moveRow;
              continueMovingRight = false;
            }

            lengthRight++;
          } //end bounds test
        }
      }//end check right
      //console.log('top right : %s, %s',lastPieceColTopRight,lastPieceRowTopRight);
      //change the pieces of the board accordingly
      if(moveCol !== lastPieceColRight)
      {
        for (var i = 0; i<lastPieceColRight-moveCol;i++)
        {
          board[moveCol+i][moveRow] = playerColor;
        }
        validMove = true;
      }//end change state right



      //check bottom
      var continueMovingBottom = true;
      var lengthBottom = 1;
      var lastPieceColBottom = moveCol;
      var lastPieceRowBottom = moveRow;
      for(var i = 0; i<BOARDLENGTH; i++)
      {
        if(continueMovingBottom)
        {
          //test bounds
          if(moveRow + lengthBottom < BOARDLENGTH)
          {
            //if the adjacent piece is the same color, do nothing
            if(length === 1 && board[moveCol][moveRow+lengthBottom] === playerColor)
            {
              //console.log('adjacent stop');
              continueMovingBottom = false;
            }
            //check if current piece is the same color
            if(board[moveCol][moveRow+lengthBottom] === playerColor && continueMovingBottom)
            {
              //console.log('else stop');
              lastPieceColBottom = moveCol;
              lastPieceRowRight = moveRow+lengthBottom;
              continueMovingRight = false;
            }

            lengthBottom++;
          } //end bounds test
        }
      }//end check bottom
      //console.log('top right : %s, %s',lastPieceColTopRight,lastPieceRowTopRight);
      //change the pieces of the board accordingly
      if(moveRow !== lastPieceRowBottom)
      {
        for (var i = 0; i<lastPieceRowBottom-moveRow;i++)
        {
          board[moveCol][moveRow+i] = playerColor;
        }
        validMove = true;
      }//end change state bottom


      //check top
      var continueMovingTop = true;
      var lengthTop = 1;
      var lastPieceColTop = moveCol;
      var lastPieceRowTop = moveRow;
      for(var i = 0; i<BOARDLENGTH; i++)
      {
        if(continueMovingTop)
        {
          //test bounds
          if(moveRow + lengthTop < BOARDLENGTH)
          {
            //if the adjacent piece is the same color, do nothing
            if(length === 1 && board[moveCol][moveRow-lengthTop] === playerColor)
            {
              //console.log('adjacent stop');
              continueMovingTop = false;
            }
            //check if current piece is the same color
            if(board[moveCol][moveRow-lengthTop] === playerColor && continueMovingTop)
            {
              //console.log('else stop');
              lastPieceColTop = moveCol;
              lastPieceRowTop = moveRow-lengthTop;
              continueMovingTop = false;
            }

            lengthTop++;
          } //end bounds test
        }
      }//end check top
      //console.log('top right : %s, %s',lastPieceColTopRight,lastPieceRowTopRight);
      //change the pieces of the board accordingly
      if(moveRow !== lastPieceRowTop)
      {
        for (var i = 0; i<moveRow-lastPieceRowTop;i++)
        {
          board[moveCol][moveRow-i] = playerColor;
        }
        validMove = true;
      }//end change state bottom



      //check if anything has changed
      if(validMove)
      {
        //console.log('ending');
        var sql = 'UPDATE gametable SET state = ?, turnPlayer = ? WHERE id = ?';
        var query = conn.query(sql, [JSON.stringify(board), nextPlayer, currentGameId], function (error, result, fields) {
          if (error) throw error;

          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({message:'true'}));
          res.end();

        });
      } else {
        //invalid move, send response
        //console.log('ending');
        var sql = 'UPDATE gametable SET state = ? WHERE id = ?';
        var query = conn.query(sql, [JSON.stringify(board), currentGameId], function (error, result, fields) {
          if (error) throw error;

          res.set('Content-Type', 'application/json');
          res.send(JSON.stringify({errormessage:'invalid move'}));
          res.end();
        });
      }


    }

  });
}//end sendMove





//local methods
function testLocal(){
  return 'local test';
}
