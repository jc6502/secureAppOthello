CREATE TABLE IF NOT EXISTS userTable(
  id int NOT NULL AUTO_INCREMENT,
  username varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  active BOOL DEFAULT 0,
  lastActive DATETIME,
  roomid int DEFAULT 0,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS chatTable(
  id int NOT NULL,
  lastMessage varchar(255),
  lastUser varchar(255),
  lastActive DATETIME,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS gameTable(
  id int NOT NULL AUTO_INCREMENT,
  user1 varchar(255),
  user2 varchar(255),
  turnPlayer varchar(255),
  state varchar(255),
  accepted int DEFAULT 0,
  startOver int DEFAULT 0,
  badMoves int DEFAULT 0,
  lastMove DATETIME,
  PRIMARY KEY (id)
);
