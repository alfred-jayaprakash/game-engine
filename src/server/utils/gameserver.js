const gameroom = require ('./gameroom');
const gameengine = require ('./gameengine');

const WAITING_STATUS = 'wait';
const GAME_START = 'start';
const GAME_PROGRESS = 'run';
const GAME_END = 'end';

//
// Connect handler: Handle client connect events
//
const handleNewConnection = (io, socket) => {
  //Setup Game join handler
  socket.on ('join', (options, callback) =>
    handleJoin (options, callback, socket, io)
  );

  //Setup Game status change handler
  socket.on ('game_status', (data, callback) =>
    handleGameStatus (data, callback, socket, io)
  );

  //Setup Disconnect handler
  socket.on ('disconnect', () => handleDisconnect (socket, io));
};

//
// Join handler: Handle join events
//
const handleJoin = (options, callback, socket, io) => {
  const {error, user} = gameroom.addUser ({id: socket.id, ...options});

  if (error) {
    //If error, return straightaway
    return callback (error, null);
  }

  socket.join (user.room, () => {
    io.to (user.room).emit ('room_data', {
      //Send updated user list
      room: user.room,
      users: gameroom.getUsersInRoom (user.room),
    });
    callback (null, gameroom.getUsersInRoom (user.room)); //All's well
  });
};

//
// Broadcast handler: Broadcast join events to rooms asynchronously
//
const broadcast = (io, socket, user) => {
  return new Promise ((resolve, reject) => {
    setTimeout (() => {
      //socket.emit ('message', generateMessage ('System', 'welcome'));
      //socket.broadcast.to (user.room).emit ('user_join', user.username); //Tell everyone that the user has joined
      io.to (user.room).emit ('room_data', {
        //Send updated user list
        room: user.room,
        users: gameroom.getUsersInRoom (user.room),
      });
      resolve ();
    }, 0);
  });
};

//
// Disconnect handler: Handle disconnect events
//
const handleDisconnect = (socket, io) => {
  const user = gameroom.removeUser (socket.id);
  if (user) {
    console.log ('Received disconnect and broadcasting to everyone', user);
    io.to (user.room).emit ('room_data', {
      room: user.room,
      users: gameroom.getUsersInRoom (user.room),
    }); //Send the updated user list
  }
};

//
// Game Status handler: Handle game status change events
//
const handleGameStatus = (data, callback, socket, io) => {
  console.log ('Received game status data ', data);
  let roomId = data.room;
  let room = gameroom.getRoom (parseInt (roomId));
  data.room = room; //Overwrite room data in to the data structure
  if (room) {
    let gameData = null;
    switch (data.status) {
      case GAME_START:
        gameData = gameengine.handleGameStart (data);
        break;
      case GAME_PROGRESS:
        gameData = gameengine.handleGameProgress (data);
        break;
      default:
        gameData = gameengine.handleGameEnd (data);
        break;
    }
    io.to (roomId).emit ('game_status', gameData); //Send game status to everyone
  }
};

module.exports = {handleNewConnection, handleDisconnect};
