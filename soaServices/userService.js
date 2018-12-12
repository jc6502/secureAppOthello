//service layer for the user functionality

//business layer connection
var userBusiness = require('../soaBusinessData/userBusiness.js');

//exposed methods

//create new user
exports.createNewUserService = function(conn, req, res) {
  userBusiness.createNewUserBusiness(conn, req, res);
}

//login user
exports.loginUserService = function(conn, req, res) {
  userBusiness.loginUserBusiness(conn, req, res);
}

//get/set current room state
exports.roomState = function(conn, data) {
  userBusiness.roomState(conn, data);
}

//get/set current room state
exports.updateLastSeen = function(conn, time, user) {
  userBusiness.updateLastSeen(conn, time, user);
}

//get/set current room state
exports.getActiveUsers = function(conn, req, res) {
  userBusiness.getActiveUsers(conn, req, res);
}

//local methods
function testLocal(){
  return 'local test';
}
