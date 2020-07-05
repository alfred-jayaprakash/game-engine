const {
  handleNewConnection,
  handleJoin,
  handleGameStatus,
  handleDisconnect,
} = require ('./gameserver');

const {
  JOIN_EVENT,
  GAME_STATUS_EVENT,
  DISCONNECT_EVENT,
  ROOM_DATA_EVENT,
  STATE_EVENT,
  GAME_START,
  GAME_PROGRESS,
  GAME_END,
} = require ('../../utils/GlobalConfig');

let gameroom;
let io;
let socket;
let roomSocketRef;
let testRoom;
let callback;
const firstClientSocketId = 999; //A fictitious for the socket
const secondClientSocketId = 999; //A fictitious for the socket

describe ('Functional tests', () => {
  beforeAll (() => {
    // tell jest not to mock gameroom
    jest.unmock ('./gameroom');

    // require the actual module so that we can mock exports on the module
    gameroom = require.requireActual ('./gameroom');

    // Create a sample room where we will run most of our tests
    testRoom = gameroom.createRoom ('jest');
  });

  beforeEach (() => {
    io = new Object ();
    socket = new Object ();
    roomSocketRef = new Object ();

    // Socket.IO mocks
    socket.on = jest.fn ();
    socket.join = jest
      .fn ()
      .mockImplementation ((room, callback) => callback ());
    socket.id = firstClientSocketId;
    roomSocketRef.emit = jest.fn ((event, data) => {});
    io.to = jest.fn ().mockReturnValue (roomSocketRef);
    callback = jest.fn ();
  });

  test ('Handle new connection should register 3 socket handlers', () => {
    handleNewConnection (io, socket);

    //Socket.on registration handled properly
    expect (socket.on.mock.calls.length).toBe (3);
    // The first argument of the first call to the function was join
    expect (socket.on.mock.calls[0][0]).toBe (JOIN_EVENT);
    // The first argument of the second call to the function was game_status
    expect (socket.on.mock.calls[1][0]).toBe (GAME_STATUS_EVENT);
    // The first argument of the third call to the function was disconnect
    expect (socket.on.mock.calls[2][0]).toBe (DISCONNECT_EVENT);
  });

  test ('Joining as a user with no username should result in error', () => {
    let options = {id: firstClientSocketId, room: testRoom.id};
    handleJoin (options, callback, socket, io);

    expect (callback).toHaveBeenCalled ();

    expect (callback.mock.calls[0][0]).toBeTruthy (); //Error should be present
    expect (callback.mock.calls[0][1]).toBeFalsy (); //Data should not be present
  });

  test ('Joining as a valid user with non-existent room should result in error', () => {
    let options = {id: firstClientSocketId, username: 'AJ', room: 123456};
    handleJoin (options, callback, socket, io);

    expect (callback).toHaveBeenCalled ();

    expect (callback.mock.calls[0][0]).toBeTruthy (); //Error should be present
    expect (callback.mock.calls[0][1]).toBeFalsy (); //Data should not be present
  });

  test ('Joining as a user with super long name should result in error', () => {
    let options = {
      id: firstClientSocketId,
      username: 'abcdefghijklmnopqrstuv',
      room: testRoom.id,
    };
    handleJoin (options, callback, socket, io);

    expect (callback).toHaveBeenCalled ();

    expect (callback.mock.calls[0][0]).toBeTruthy (); //Error should be present
    expect (callback.mock.calls[0][1]).toBeFalsy (); //Data should not be present
  });

  test ('Joining as a user with valid name and valid room should be successful', () => {
    let options = {
      id: firstClientSocketId,
      username: 'AJ',
      room: testRoom.id,
    };
    handleJoin (options, callback, socket, io);

    expect (socket.join).toHaveBeenCalled ();

    expect (socket.join.mock.calls[0][0]).toEqual (testRoom.id); //Socket should join the room
    expect (socket.join.mock.calls[0][1]).toBeTruthy (); //Second args should be present

    expect (io.to).toHaveBeenCalled (); //Broadcast to room should happen
    expect (callback).toHaveBeenCalled (); //Data should be sent back to joining user

    expect (callback.mock.calls[0][0]).toBeFalsy (); //Error should not be present
    expect (callback.mock.calls[0][1]).toBeTruthy (); //Data should be present

    //TODO: Add some more checks on the data
  });

  test ('Joining as a duplicate user in same room should return error', () => {
    let options = {
      id: firstClientSocketId,
      username: 'AJ',
      room: testRoom.id,
    };
    handleJoin (options, callback, socket, io);
    expect (callback).toHaveBeenCalled ();

    expect (callback.mock.calls[0][0]).toBeTruthy (); //Error should be present
    expect (callback.mock.calls[0][1]).toBeFalsy (); //Data should not be present

    expect (socket.join).not.toHaveBeenCalled ();
  });

  test ('Joining as a different user in same room should be successful', () => {
    let options = {
      id: secondClientSocketId,
      username: 'John',
      room: testRoom.id,
    };
    handleJoin (options, callback, socket, io);

    expect (socket.join).toHaveBeenCalled ();

    expect (socket.join.mock.calls[0][0]).toEqual (testRoom.id); //Socket should join the room
    expect (socket.join.mock.calls[0][1]).toBeTruthy (); //Second args should be present

    expect (io.to).toHaveBeenCalled (); //Broadcast to room should happen
    expect (callback).toHaveBeenCalled (); //Data should be sent back to joining user

    expect (callback.mock.calls[0][0]).toBeFalsy (); //Error should not be present
    expect (callback.mock.calls[0][1]).toBeTruthy (); //Data should be present
  });

  test ('Game start status message should trigger broadcast of game start to everyone in room', () => {
    let game_status_data = {
      status: GAME_START,
      room: testRoom.id,
    };
    handleGameStatus (game_status_data, callback, socket, io);

    expect (io.to).toHaveBeenCalled (); //Broadcast to room should happen

    // Data should be sent to the same room that the user was
    expect (io.to.mock.calls.length).toBe (1);
    expect (io.to.mock.calls[0][0]).toEqual (testRoom.id);

    expect (roomSocketRef.emit).toHaveBeenCalled ();
    expect (roomSocketRef.emit.mock.calls[0][0]).toEqual (GAME_STATUS_EVENT);
    expect (roomSocketRef.emit.mock.calls[0][1]).toBeTruthy ();
  });

  test ('Game progress message should trigger broadcast of game start to everyone in room', () => {
    let game_status_data = {
      status: GAME_PROGRESS,
      room: testRoom.id,
      state: {
        response: 'one',
      },
    };
    handleGameStatus (game_status_data, callback, socket, io);

    expect (io.to).toHaveBeenCalled (); //Broadcast to room should happen

    // Data should be sent to the same room that the user was
    expect (io.to.mock.calls.length).toBe (1);
    expect (io.to.mock.calls[0][0]).toEqual (testRoom.id);

    expect (roomSocketRef.emit).toHaveBeenCalled ();
    expect (roomSocketRef.emit.mock.calls[0][0]).toEqual (GAME_STATUS_EVENT);
    expect (roomSocketRef.emit.mock.calls[0][1]).toBeTruthy ();
  });

  test ('Game end status message should trigger broadcast of game end to everyone in room', () => {
    let game_status_data = {
      status: GAME_END,
      room: testRoom.id,
    };
    handleGameStatus (game_status_data, callback, socket, io);

    expect (io.to).toHaveBeenCalled (); //Broadcast to room should happen

    // Data should be sent to the same room that the user was
    expect (io.to.mock.calls.length).toBe (1);
    expect (io.to.mock.calls[0][0]).toEqual (testRoom.id);

    expect (roomSocketRef.emit).toHaveBeenCalled ();
    expect (roomSocketRef.emit.mock.calls[0][0]).toEqual (GAME_STATUS_EVENT);
    expect (roomSocketRef.emit.mock.calls[0][1]).toBeTruthy ();
  });

  test ('Disconnection should result in broadcast to all users in the room', () => {
    //
    // Invoke
    //
    handleDisconnect (socket, io);

    //
    // Verify Results
    //

    // io.to should be called with correct room
    expect (io.to).toHaveBeenCalled ();
    // Data should be sent to the same room that the user was
    expect (io.to.mock.calls.length).toBe (1);
    expect (io.to.mock.calls[0][0]).toEqual (testRoom.id);
  });
});
