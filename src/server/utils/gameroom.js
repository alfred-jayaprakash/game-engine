const {GAME_PROGRESS, GAME_END} = require ('../../utils/GlobalConfig');

const rooms = new Map ();

const genRoomId = () => Math.floor (100000 + Math.random () * 900000);
//
// Create a new room
//
const createRoom = roomname => {
  let room_id = genRoomId ();
  //If room id already exists, then create another room
  while (rooms.get (room_id))
    room_id = genRoomId ();

  //
  // Room data structure
  //
  let room = {
    id: room_id,
    roomname,
    users: [],
  };
  rooms.set (room_id, room);
  return room;
};

//
// Remove a room
//
const removeRoom = room_id => {
  let room = rooms.get (room_id);
  rooms.delete (room_id);
  return room;
};

//
// Get a room
//
const getRoom = room_id => rooms.get (room_id);

//
// Get all the rooms
//
const getAllRooms = () => rooms;

//
//
//
const getUsersInRoom = (room_id, score_sort = false) => {
  let room = getRoom (room_id);
  if (!room) {
    return {
      error: 'Invalid room',
    };
  }
  let roomUsers = room.users;
  if (score_sort) roomUsers = room.users.sort ((x, y) => y.score - x.score);
  return roomUsers;
};

//
//
//
const addUser = ({id, username, room}) => {
  if (!username) return {error: 'Invalid user name'};

  if (username.length > 20) {
    return {error: 'Username cannot be longer than 20 chars'};
  }

  // Clean the data
  username = username.trim ();

  let my_room = getRoom (room);
  if (!my_room) {
    return {error: 'Invalid room'};
  }

  if (
    my_room.status &&
    (my_room.status === GAME_PROGRESS || my_room === GAME_END)
  ) {
    console.log (username, 'attempting to join in progress game room =', room);
    return {error: 'Game already in progress'};
  }

  // Check for existing user
  const existingUser = my_room.users.find (user => {
    return user.username.toLowerCase () === username.toLowerCase ();
  });

  // Validate username
  if (existingUser) {
    return {
      error: 'Username is in use!',
    };
  }

  // Store user
  const user = {id, username, room, score: 0, active: true};
  my_room.users.push (user);
  return {user};
};

//
// Is it an existing user
//
const isUserExists = (username, room) => {
  //Clean the data
  username = username.trim ();
  let my_room = getRoom (room);

  //If user found in the room then return true
  return (
    my_room.users.findIndex (
      user => user.username.toLowerCase () === username.toLowerCase ()
    ) !== -1
  );
};

//
// Get an user for the given socket id
//
const getUser = id => {
  let returnedUser = undefined;
  let BreakException = {};
  try {
    rooms.forEach (room => {
      const index = room.users.findIndex (user => user.id === id);
      if (index !== -1) {
        returnedUser = room.users[index];
        throw BreakException;
      }
    });
  } catch (e) {
    if (e !== BreakException) throw e;
    return returnedUser;
  }
};

//
//
//
const removeUser = id => {
  let returnedUser = undefined;
  let BreakException = {};
  try {
    rooms.forEach (room => {
      const index = room.users.findIndex (user => user.id === id);
      if (index !== -1) {
        returnedUser = room.users.splice (index, 1)[0];
        throw BreakException;
      }
    });
  } catch (e) {
    if (e !== BreakException) throw e;
    return returnedUser;
  }
};

//
//
//
const removeUserFromRoom = (username, room_id) => {
  let room = getRoom (room_id);
  if (!room) {
    return {error: 'Invalid room'};
  }

  const index = room.users.findIndex (
    user => user.username.toLowerCase () === username.toLowerCase ()
  );
  if (index !== -1) {
    const user = room.users.splice (index, 1)[0];
    return {user};
  }
  return {error: 'Could not find user'};
};

module.exports = {
  getRoom,
  getAllRooms,
  createRoom,
  removeRoom,
  addUser,
  getUser,
  removeUser,
  removeUserFromRoom,
  getUsersInRoom,
  isUserExists,
};
