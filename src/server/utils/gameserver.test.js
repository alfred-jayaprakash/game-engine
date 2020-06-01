const {handleNewConnection, handleDisconnect} = require ('./gameserver');

test ('Handle new connection should register socket message', () => {
  let io = new Object ();
  let socket = new Object ();
  socket.on = jest.fn ();
  handleNewConnection (io, socket);
  //Exactly once it should be called
  expect (socket.on.mock.calls.length).toBe (2);

  // The first argument of the first call to the function was join
  expect (socket.on.mock.calls[0][0]).toBe ('join');

  // The first argument of the second call to the function was disconnect
  expect (socket.on.mock.calls[1][0]).toBe ('disconnect');
});

// tell jest not to mock users
jest.unmock ('./users');

// require the actual module so that we can mock exports on the module
const users = require.requireActual ('./users');

test ('Disconnection should result in broadcast to all users', () => {
  //
  // Test data
  //
  const userData = {
    username: 'AJ',
    room: 'test',
  };
  const socketId = 999;
  const usersInRoomData = ['A', 'B'];

  //
  // Setup all the mocks
  //

  // User mocks
  users.removeUser = jest.fn (id => {
    return userData;
  });
  users.getUsersInRoom = jest.fn (room => usersInRoomData);

  // Socket.IO mocks
  let io = new Object ();
  let socket = new Object ();
  socket.id = socketId; //Set a fictitious id for the socket
  let room = new Object ();
  room.emit = jest.fn ((event, data) => {});
  io.to = jest.fn ().mockReturnValue (room);

  //
  // Invoke
  //
  handleDisconnect (socket, io);

  //
  // Verify Results
  //
  //removeUser should should be called once exactly
  expect (users.removeUser.mock.calls.length).toBe (1);

  // removeUser should be called with the socket id of the user disconnected
  expect (users.removeUser.mock.calls[0][0]).toBe (socketId);

  // getUserInRoom should be called with the room of the user disconnected
  expect (users.getUsersInRoom.mock.calls[0][0]).toBe (userData.room);

  // io.to should be called with correct room
  expect (io.to.mock.calls.length).toBe (2);
  // Data should be sent to the same room that the user was
  expect (io.to.mock.calls[0][0]).toEqual (userData.room);
  expect (io.to.mock.calls[1][0]).toEqual (userData.room);

  //Emit should be called twice
  expect (room.emit.mock.calls.length).toBe (2);

  // First time, emit should be called with user_leave event
  expect (room.emit.mock.calls[0][0]).toBe ('user_leave');
  expect (room.emit.mock.calls[0][1]).toBe (userData.username);

  // Second time, emit should be called with room_data event
  expect (room.emit.mock.calls[1][0]).toBe ('room_data');
  expect (room.emit.mock.calls[1][1]).toEqual ({
    room: userData.room,
    users: usersInRoomData,
  });
});
