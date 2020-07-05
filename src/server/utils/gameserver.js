const gameroom = require ('./gameroom');
const gameengine = require ('./gameengine');
const {
  JOIN_EVENT,
  GAME_STATUS_EVENT,
  DISCONNECT_EVENT,
  ROOM_DATA_EVENT,
  STATE_EVENT,
  GAME_START,
  GAME_PROGRESS,
  GAME_END,
  MAXIMUM_USER_SIZE,
  GAME_ADMIN_USER,
} = require ('../../utils/GlobalConfig');

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
// Game Status handler: Handle game status change events
//
const handleGameStatus = (client_game_state_data, callback, socket, io) => {
  console.log (
    'Received game status data in gameserver.js',
    client_game_state_data
  );
  let {room: roomId, status} = client_game_state_data;
  let current_room = gameroom.getRoom (parseInt (roomId));
  if (current_room === null || current_room.users === null) return; //Invalid state
  let current_user = current_room.users.find (user => user.id === socket.id);

  const game_state_data = {
    status,
    room: current_room,
    user: current_user,
    state: client_game_state_data.state,
  };

  if (current_room) {
    let game_engine_response = null;
    switch (status) {
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
      console.log ('Contained update users', game_state_data);
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

module.exports = {
  handleNewConnection,
  handleJoin,
  handleGameStatus,
  handleDisconnect,
};
