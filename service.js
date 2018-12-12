/*

Server for the Othello Secure App project

*/



/*
  Definitions
*/

//packages
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const expressSanitizer = require('express-sanitizer');
//const cors = require('cors'); testing CORS preflight support

//imports
var serverConstantsFile = require('./scripts/serverConstants.js');
var userService = require('./soaServices/userService.js');
var chatService = require('./soaServices/chatService.js');
var gameService = require('./soaServices/gameService.js');

//init packages
app.use(bodyParser.json());
app.use(expressSanitizer());
app.use(express.static('client'));
const port = 3000;



/*
  Setup
*/
//print initial line in console
console.log('\n\n#######################');

//get constants
const serverConstants = serverConstantsFile.getConstants();

//create dbms connection
var con = mysql.createConnection({
  host: "localhost",
  user: serverConstants.dbuser,
  password: serverConstants.dbpass,
  database: serverConstants.dbname
});

//test query and connection to local mysql instance
var sql = 'SHOW TABLES'
con.connect(function(err) {
  if (err) throw err;
  console.log("Database connected");
  //test query on startup
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Test Query: " + JSON.stringify(result));
    console.log('#######################\n');
  });
});




//file server
app.get('/', (req, res) => {
   res.sendFile('index.html');
});
//app.get('/', (req, res) => res.send(userService.test('pls work')));


//start server
app.listen(port, function(){
  console.log('App listening on port %d',port);
  //console.dir();
  //console.log('++++');
});




//AJAX handler

//POST handler
app.post('/ajax', bodyParser.json(), function (req, res) {
  //get target service and method, sanitize input
  var service = req.sanitize(req.body.service);
  var method = req.sanitize(req.body.method);
  //console.log(JSON.stringify(req.body));
  //console.log('sanitized input: '+service+' | '+method);

  //call target service and method
  if(service === 'user')
  {
    switch (method) {
      case 'newUser':
        userService.createNewUserService(con, req, res);
        break;
      case 'loginUser':
        userService.loginUserService(con, req, res);
        break;
      case 'getActiveUsers':
        userService.getActiveUsers(con, req, res);
        break;
      default:
        res.set('Content-Type', 'application/json');
        res.send({errormessage:'unable to find user method'});
        res.end();
        break;
    }
  } else if(service === 'game') {
    switch (method) {
      case 'sendMove':
        gameService.sendMove(con, req, res);
        break;
      case 'sendChallenge':
        gameService.sendChallenge(con, req, res);
        break;
      case 'checkChallenge':
        gameService.checkChallenge(con, req, res);
        break;
      case 'acceptChallenge':
        gameService.acceptChallenge(con, req, res);
        break;
      default:
        res.set('Content-Type', 'application/json');
        res.send({errormessage:'unable to find game method'});
        res.end();
        break;
    }
  } else if(service === 'chat') {
    switch (method) {
      case 'sendChatMessage':
        chatService.receiveChatMessage(con, req, res);
        break;
      case 'getChatMessage':
        chatService.getChatMessage(con, req, res);
        break;
      default:
        res.set('Content-Type', 'application/json');
        res.send({errormessage:'unable to find chat method'});
        res.end();
        break;
    }
  } else {
    res.set('Content-Type', 'application/json')
    res.send({errormessage:'no such service'})
  }
}); //end post handler
