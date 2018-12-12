function Piece(board, col, row, type) {
  //attributes
  this.size = 50;
  this.board = board;
  this.type = type; //0 for empty, 1 for black, 2 for white
  this.id = 'piece_'+row+col;
  this.row = row;
  this.col = col;
  this.x = this.size * (this.col+1);
  this.y = this.size * (this.row+1);
  this.cell = document.createElementNS(board.SVGNS,"g");
  this.innerCircle = '';
  this.outerCircle = '';

  this.object = this.create();
  this.updateState();
  this.board.svg.appendChild(this.object);

  return this;
}

Piece.prototype = {
  //create piece
  create:function(){
		this.piece=document.createElementNS(this.board.svgns,'g');

    var svgRect=document.createElementNS(this.board.svgns,'rect');
		svgRect.setAttributeNS(null,'x',this.x+'px');
		svgRect.setAttributeNS(null,'y',this.y+'px');
		svgRect.setAttributeNS(null,'width',this.size+'px');
		svgRect.setAttributeNS(null,'height',this.size+'px');
    svgRect.setAttributeNS(null,'fill','white');
    this.piece.appendChild(svgRect);

    var circleX = this.x + (this.size/2);
    var circleY = this.y + (this.size/2);

    svgCircOuter=document.createElementNS(this.board.svgns,'circle');
  	svgCircOuter.setAttributeNS(null,"r",'23');
  	svgCircOuter.setAttributeNS(null,"transform","translate("+circleX+","+circleY+")");
    svgCircOuter.setAttributeNS(null,'fill','black');
    this.outerCircle = svgCircOuter;
    this.piece.appendChild(svgCircOuter);

    svgCircInner=document.createElementNS(this.board.svgns,'circle');
  	svgCircInner.setAttributeNS(null,"r",'20');
  	svgCircInner.setAttributeNS(null,"transform","translate("+circleX+","+circleY+")");
    svgCircInner.setAttributeNS(null,'fill','white');
    this.innerCircle = svgCircInner;
    this.piece.appendChild(svgCircInner);

    var svgRow = this.row;
    var svgCol = this.col;
    this.piece.addEventListener('mousedown',function(){ gameboard.sendMove(svgRow, svgCol);},false);

    return this.piece;
  },//end create

  //change state
  updateState:function()
  {
    if(this.type === 1)
    {
    	this.innerCircle.setAttributeNS(null,"fill",'white');
      this.outerCircle.setAttributeNS(null,"fill",'black');
    } else if (this.type === 2) {
      this.innerCircle.setAttributeNS(null,"fill",'black');
      this.outerCircle.setAttributeNS(null,"fill",'black');
    } else {
      this.innerCircle.setAttributeNS(null,"fill",'white');
      this.outerCircle.setAttributeNS(null,"fill",'white');
    }
  }

}
