/*
  defines some changing constants between the local test environemnt and the live server
*/


//local testing
var DBUSER = 'root';
var DBPASS = 'othelloMysql1';
var DBNAME = 'othello';

//server side
/*
var DBUSER = 'dbuser';
var DBPASS = 'othelloMysql1';
var DBNAME = 'dbname';
*/

//exposed method - returns the constants to the server
exports.getConstants = function() {
  return {'dbuser':DBUSER, 'dbpass':DBPASS, 'dbname':DBNAME};
}
