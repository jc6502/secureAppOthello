//service layer for the game

//business layer connection
var gameBusiness = require('../soaBusinessData/gameBusiness.js');

//exposed methods

//acepts a move from the turn player and returns the updated game state or false
exports.sendMove = function(conn, req, res) {
  gameBusiness.sendMove(conn, req, res);
}

//creates a new game and sets up a challenge notification
exports.sendChallenge = function(conn, req, res) {
  gameBusiness.sendChallenge(conn, req, res);
}

//checks the current game room state for a user
exports.checkChallenge = function(conn, req, res) {
  gameBusiness.checkChallenge(conn, req, res);
}

//accepts a challenge for a game
exports.acceptChallenge = function(conn, req, res) {
  gameBusiness.acceptChallenge(conn, req, res);
}
