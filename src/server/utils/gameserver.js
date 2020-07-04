const gameroom = require ('./gameroom');
const gameengine = require ('./gameengine');

const JOIN_EVENT = 'join';
const GAME_STATUS_EVENT = 'game_status';
const DISCONNECT_EVENT = 'disconnect';
const ROOM_DATA_EVENT = 'room_data';
const STATE_EVENT = 'state';

const GAME_START = 'start';
const GAME_PROGRESS = 'run';
const GAME_END = 'end';

const MAXIMUM_USER_SIZE = 20;
const GAME_ADMIN_USER = 'Game Admin';

//
// Connect handler: Handle client connect events
//
const handleNewConnection = (io, socket) => {
  //Setup Game join handler
  socket.on (JOIN_EVENT, (options, callback) =>
    handleJoin (options, callback, socket, io)
  );

  //Setup Game status change handler
  socket.on (GAME_STATUS_EVENT, (data, callback) =>
    handleGameStatus (data, callback, socket, io)
  );

  //Setup Disconnect handler
  socket.on (DISCONNECT_EVENT, callback => handleDisconnect (socket, io));
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
  let roomUsers = gameroom.getUsersInRoom (user.room);
  if (roomUsers.length > MAXIMUM_USER_SIZE)
    roomUsers = roomUsers.slice (0, MAXIMUM_USER_SIZE);

  socket.join (user.room, () => {
    io.to (user.room).emit (ROOM_DATA_EVENT, {
      //Send updated user list
      room: user.room,
      users: roomUsers,
    });
    callback (null, roomUsers); //All's well
  });
};

//
// Disconnect handler: Handle disconnect events
//
const handleDisconnect = (socket, io) => {
  const user = gameroom.removeUser (socket.id);
  if (user) {
    console.log ('Received disconnect and broadcasting to everyone', user);
    io.to (user.room).emit (ROOM_DATA_EVENT, {
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
  if (room === null || room.users === null) return; //Invalid state
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
      game_state_data.update_users.forEach (socketId => {
        io.to (socketId).emit (STATE_EVENT, game_state_data.update_data);
      });
    }

    //
    // Now copy the latest scores to update everyone
    //
    let scores = [];
    let roomUsers = gameroom.getUsersInRoom (parseInt (roomId), true); //Sort users by scores descending
    //Trim the size of array we send back to clients
    if (roomUsers.length > MAXIMUM_USER_SIZE)
      roomUsers = roomUsers.slice (0, MAXIMUM_USER_SIZE);
    roomUsers.forEach (user => {
      if (user.username !== GAME_ADMIN_USER) {
        scores.push ({
          user: user.username,
          score: user.score,
        });
      }
    });
    game_engine_response.scores = scores; //Set the current scores in the game engine response

    // console.log (
    //   'Game status response to be broadcasted to everyone ',
    //   game_engine_response
    // );
    io.to (roomId).emit (GAME_STATUS_EVENT, game_engine_response); //Send update game status to everyone
  }
};

module.exports = {handleNewConnection, handleDisconnect};
