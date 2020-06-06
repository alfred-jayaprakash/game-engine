const gameroom = require ('./gameroom');

//
// Connect handler: Handle client connect events
//
const handleNewConnection = (io, socket) => {
  //Connect handler
  console.log ('New client connected');

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

  broadcast (io, socket, user).then (() => {
    //Tell others that the user has joined
    console.log (user.username, 'joined the game', user.room);
  });

  return callback (null, gameroom.getUsersInRoom (user.room)); //All's well
};

//
// Broadcast handler: Broadcast join events to rooms asynchronously
//
const broadcast = (io, socket, user) => {
  return new Promise ((resolve, reject) => {
    setTimeout (() => {
      socket.join (user.room);

      //socket.emit ('message', generateMessage ('System', 'welcome'));
      socket.broadcast.to (user.room).emit ('user_join', user.username); //Tell everyone that the user has joined
      io.to (user.room).to (user.room).emit ('room_data', {
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
    io.to (user.room).emit ('user_leave', user.username); //Tell everyone user has left
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
  const gameData = {
    status: data.status,
  };
  io.to (data.room).emit ('game_status', gameData); //Tell everyone user has left
};

//
// Handle start game
//
const startGame = room => {
  const users = room.getUsersInRoom ();
  users.forEach (user => {});
  if (user) {
    io.to (user.room).emit ('user_leave', user.username); //Tell everyone user has left
    io.to (user.room).emit ('room_data', {
      room: user.room,
      users: gameroom.getUsersInRoom (user.room),
    }); //Send the updated user list
  }
};
module.exports = {handleNewConnection, handleDisconnect};
