//service layer for the chat

//business layer connection
var chatBusiness = require('../soaBusinessData/chatBusiness.js');

//exposed methods

//add new chat message to dbms
exports.receiveChatMessage = function(conn, req, res) {
  chatBusiness.receiveChatMessage(conn, req, res);
}

//gets the last chat message from given chat room
exports.getChatMessage = function(conn, req, res) {
  chatBusiness.getChatMessage(conn, req, res);
}
