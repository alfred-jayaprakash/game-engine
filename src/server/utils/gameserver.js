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
  GAME_STOP,
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
const handleJoin = (client_data, callback, socket, io) => {
  const {error, user} = gameroom.addUser ({id: socket.id, ...client_data});
  if (error) {
    //If error, return straightaway
    return callback (error, null);
  }
  let roomUsers = gameroom.getUsersInRoom (user.room);
  if (roomUsers.length > MAXIMUM_USER_SIZE)
    roomUsers = roomUsers.slice (0, MAXIMUM_USER_SIZE);
  //Dilute the list by removing unwanted attributes
  roomUsers = roomUsers.map (({username, score, active}) => {
    return {username, score, active};
  });
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
  if (!current_room || !current_room.users) return; //Invalid state
  let current_user = current_room.users.find (user => user.id === socket.id);
  if (!current_user) return; //Invalid state
  current_user.active = true; //Since current user is send data, let's set him active
  const game_state_data = {
    status,
    room: current_room,
    user: current_user,
    state: client_game_state_data.state,
  };

  if (current_room) {
    let game_engine_response = null;
    let client_response = {status};
    switch (status) {
      case GAME_START:
        game_engine_response = gameengine.handleGameStart (game_state_data);
        client_response.config = game_engine_response.config; //Copy Game Config
        client_response.state = game_engine_response.state; //Copy Game state
        //Now set the current room to Game started
        current_room.status = GAME_PROGRESS;
        break;
      case GAME_PROGRESS:
        game_engine_response = gameengine.handleGameProgress (game_state_data);
        break;
      case GAME_STOP:
        game_engine_response = gameengine.handleGameEnd (game_state_data);
        //Now set the current room to Game ended
        current_room.status = GAME_STOP;
        game_engine_response.status = GAME_STOP;
        break;
      case GAME_END:
        game_engine_response = gameengine.handleGameEnd (game_state_data);
        socket.emit (GAME_STATUS_EVENT, game_engine_response);
        if (callback) {
          return callback ();
        } else {
          return;
        }
      default:
      //Error handling
    }

    //
    // If there is any update data sent to specific set of users
    //
    if (game_engine_response.update_users && game_engine_response.update_data) {
      console.log ('Contained update users', game_engine_response.update_users);
      game_engine_response.update_users.forEach (socketId => {
        io.to (socketId).emit (STATE_EVENT, game_engine_response.update_data);
      });
    }

    //
    // Now copy the latest results to update everyone only if the
    // game is in progress or the game has ended
    //
    if (
      current_room.status === GAME_PROGRESS ||
      current_room.status === GAME_STOP
    ) {
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
      client_response.scores = scores; //Finally write the scores
      console.log ('Sending response to all clients ', client_response);

      io.to (roomId).emit (GAME_STATUS_EVENT, client_response); //Send update game status to everyone
    }
  }
  if (callback) return callback ();
};

//
// Disconnect handler: Handle disconnect events
//
const handleDisconnect = (socket, io) => {
  const user = gameroom.getUser (socket.id);
  if (user) {
    console.log (user.username, 'lost connection to server');
    user.active = false; //Set the user as inactive
    //Dilute the response sent
    let users = gameroom
      .getUsersInRoom (user.room)
      .map (({username, score, active}) => {
        return {username, score, active};
      });
    io.to (user.room).emit (ROOM_DATA_EVENT, {
      room: user.room,
      users,
    }); //Send the updated user list
  }
};

module.exports = {
  handleNewConnection,
  handleJoin,
  handleGameStatus,
  handleDisconnect,
};
