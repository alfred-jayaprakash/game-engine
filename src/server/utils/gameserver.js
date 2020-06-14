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
const handleGameStatus = (game_state_data, callback, socket, io) => {
  console.log ('Received game status data in gameserver.js', game_state_data);
  let roomId = game_state_data.room;
  let room = gameroom.getRoom (parseInt (roomId));
  let current_user = room.users.find (user => user.id === socket.id);
  game_state_data.room = room; //Overwrite room data in to the data structure
  game_state_data.user = current_user; //Set the current user data
  game_state_data.update_data = null;
  game_state_data.update_users = null;

  if (room) {
    let game_engine_response = null;
    switch (game_state_data.status) {
      case GAME_START:
        game_engine_response = gameengine.handleGameStart (game_state_data);
        break;
      case GAME_PROGRESS:
        game_engine_response = gameengine.handleGameProgress (game_state_data);
        break;
      default:
        game_engine_response = gameengine.handleGameEnd (game_state_data);
        break;
    }
    //
    // If there is any update data sent to specific set of users
    //
    if (game_state_data.update_users && game_state_data.update_data) {
      console.log ('Found users to be updated ', game_state_data.update_users);
      game_state_data.update_users.forEach (socketId => {
        io.to (socketId).emit ('state', game_state_data.update_data);
      });
    }

    //
    // Now copy the latest scores to update everyone
    //
    let scores = [];
    room.users.forEach (user => {
      if (user.username !== 'Game Admin') {
        scores.push ({
          user: user.username,
          score: user.score,
        });
      }
    });
    game_engine_response.scores = scores; //Set the current scores in the game engine response

    console.log (
      'Game status response to be broadcasted to everyone ',
      game_engine_response
    );
    io.to (roomId).emit ('game_status', game_engine_response); //Send update game status to everyone
  }
};

module.exports = {handleNewConnection, handleDisconnect};
