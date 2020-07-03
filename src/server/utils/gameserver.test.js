const {handleNewConnection, handleDisconnect} = require ('./gameserver');

let gameroom;
let io;
let socket;
let room;
const socketId = 999; //A fictitious for the socket

describe ('Functional tests', () => {
  beforeAll (() => {
    // tell jest not to mock gameroom
    jest.unmock ('./gameroom');

    // require the actual module so that we can mock exports on the module
    gameroom = require.requireActual ('./gameroom');
  });

  beforeEach (() => {
    io = new Object ();
    socket = new Object ();
    room = new Object ();

    // Socket.IO mocks
    socket.on = jest.fn ();
    socket.id = socketId;
    room.emit = jest.fn ((event, data) => {});
    io.to = jest.fn ().mockReturnValue (room);
  });

  test ('Handle new connection should register socket message', () => {
    handleNewConnection (io, socket);
    //Socket.on is called 3 times one each for join, game_status and disconnect
    expect (socket.on.mock.calls.length).toBe (3);

    // The first argument of the first call to the function was join
    expect (socket.on.mock.calls[0][0]).toBe ('join');

    // The first argument of the second call to the function was game_status
    expect (socket.on.mock.calls[1][0]).toBe ('game_status');

    // The first argument of the third call to the function was disconnect
    expect (socket.on.mock.calls[2][0]).toBe ('disconnect');
  });

  test ('Disconnection should result in broadcast to all users in the room', () => {
    //
    // Test data
    //
    const userData = {
      username: 'AJ',
      room: 'test',
    };
    const usersInRoomData = ['A', 'B'];

    //
    // Setup all the mocks
    //

    // User mocks
    gameroom.removeUser = jest.fn (id => {
      return userData;
    });
    gameroom.getUsersInRoom = jest.fn (room => usersInRoomData);

    //
    // Invoke
    //
    handleDisconnect (socket, io);

    //
    // Verify Results
    //
    //removeUser should should be called once exactly
    expect (gameroom.removeUser.mock.calls.length).toBe (1);

    // removeUser should be called with the socket id of the user disconnected
    expect (gameroom.removeUser.mock.calls[0][0]).toBe (socketId);

    // getUserInRoom should be called with the room of the user disconnected
    expect (gameroom.getUsersInRoom.mock.calls[0][0]).toBe (userData.room);

    // io.to should be called with correct room
    expect (io.to.mock.calls.length).toBe (1);
    // Data should be sent to the same room that the user was
    expect (io.to.mock.calls[0][0]).toEqual (userData.room);
    //expect (io.to.mock.calls[1][0]).toEqual (userData.room);

    //Emit should be called once
    expect (room.emit.mock.calls.length).toBe (1);

    // Second time, emit should be called with room_data event
    expect (room.emit.mock.calls[0][0]).toBe ('room_data');
    expect (room.emit.mock.calls[0][1]).toEqual ({
      room: userData.room,
      users: usersInRoomData,
    });
  });
});
