function Board(svg) {
  //attributes
  this.width = 8;
  this.height = 8;
  this.board = new Array(this.width);
  this.svg = svg;
  this.svgns = "http://www.w3.org/2000/svg";
  this.currentPlayerTurn = '';
  this.roomId = 0;

  return this;
}

Board.prototype = {
  //create pieces
  create:function(){
    //make array of pieces
    for(var i = 0; i<this.board.length; i++)
    {
      this.board[i] = new Array(this.height);
      for(var j = 0; j<this.board[i].length; j++)
      {
        //console.log('creating '+i+j);
        this.board[i][j] = new Piece(this, i, j, 1);
      }
    }
  },//end create

  //update board
  updateState:function(textBoard)
  {
    //for every piece, update its svg based on its numeric state
    newBoard = JSON.parse(textBoard);
    for(var i = 0; i<this.board.length; i++)
    {
      for(var j = 0; j<this.board[i].length; j++)
      {
        this.board[i][j].type = newBoard[i][j];
        this.board[i][j].updateState();
      }
    }
  },

  //sends the move to the sever to update the game
  sendMove:function(row, col)
  {
    console.log('col: %s | row %s',col,row);

    //check for roomid and turn player
    if(window.roomid !== 0 && window.user === gameboard.currentPlayerTurn)
    {
      //*
      var dataToSend = {service:'game',method:'sendMove',data:{user:window.user, roomid:window.roomid, movecol:col, moverow:row}};
      $.ajax({
        type: "POST",
        url: SERVERADR,
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        contentType: 'application/json',
        success: function( returnedData, textStatus, jQxhr ){
            console.dir(returnedData);
            //gameboard.board = returnedData.board;
            //gameboard.updateState();
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log( errorThrown );
            //show error message
            addErrorMessage('unable to send move');
        }
      });
      //*/
    } else {
      addErrorMessage('not your turn');
    }
  }
}
