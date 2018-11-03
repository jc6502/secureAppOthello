/*

Service layer for the Othello Secure App project

*/

//packages
const express = require('express');
const app = express();
const port = 3000;

//imports
var userService = require('./soaServices/userService.js');


//file server
app.get('/', (req, res) => res.send(userService.test('pls work')));


//start server
app.listen(port, function(){
  console.log('App listening on port %d',port);
  //console.dir();
  //console.log('++++');
});
