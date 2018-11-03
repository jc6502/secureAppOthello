//service layer for the user functionality

//exposed methods
exports.test = function(input) {
  return input+': testing outside access: '+testLocal();
}

//local methods
function testLocal(){
  return 'local test';
}
