import io from 'socket.io-client';
import GameEngine from './GameEngine';

//
// Setup the mock object
//
let mocksocket = new Object ();
mocksocket.on = jest.fn ().mockImplementation ((event, callback) => {
  callback ('data');
});
mocksocket.emit = jest.fn ().mockImplementation ((event, data, callback) => {
  callback ('error', 'data');
});
jest.mock ('socket.io-client', () => {
  //Now mock socket.io-client
  return jest.fn ().mockImplementation (() => mocksocket);
});

//Setup before each test
beforeEach (() => {
  io.mockClear ();
  mocksocket.on.mockClear ();
});

test ('Connect should invoke IO constructor once and only once', () => {
  GameEngine.connect ();
  expect (io).toHaveBeenCalledTimes (1); //Constructor should be invoked
  GameEngine.disconnect ();
});

test ('Join should invoke constructor and emit join message', () => {
  //Setup test data
  const username = 'AJ';
  const room = 'test';
  const callback = jest.fn ();

  GameEngine.connect ();
  GameEngine.join (username, room, callback);
  expect (io).toHaveBeenCalledTimes (1); //Constructor should be invoked once
  expect (mocksocket.emit).toHaveBeenCalledTimes (1); //Emit should be called once
  expect (mocksocket.emit.mock.calls[0][0]).toEqual ('join'); //1st Arg: 'join' event
  expect (mocksocket.emit.mock.calls[0][1]).toEqual ({username, room}); //2nd Arg: {username, room} as data
  expect (callback).toHaveBeenCalled (); //Callback should be called once
  expect (callback.mock.calls[0][0]).toEqual ('error'); //Error should be sent first
  expect (callback.mock.calls[0][1]).toEqual ('data'); //Data should be sent second

  GameEngine.disconnect ();
});

test ('registerForRoomNotifications should register callback function', () => {
  //Setup test data
  const callback = jest.fn ();

  GameEngine.connect ();
  GameEngine.registerForRoomNotifications (callback);
  expect (mocksocket.on).toHaveBeenCalledTimes (2); //socket.on should be called twice until now
  expect (mocksocket.on.mock.calls[1][0]).toEqual ('room_data'); //1st Arg: 'room_data' message
  expect (callback).toHaveBeenCalledTimes (1); //Callback should be called once
  expect (callback.mock.calls[0][0]).toEqual ('data'); //Data received from server should be sent back to callback

  GameEngine.disconnect ();
});

test ('registerForGameStart should register callback function', () => {
  //Setup test data
  const callback = jest.fn ();

  GameEngine.connect ();
  GameEngine.registerForGameStart (callback);
  expect (mocksocket.on).toHaveBeenCalledTimes (2); //socket.on should be called twice until now
  expect (mocksocket.on.mock.calls[1][0]).toEqual ('game_start'); //1st Arg: 'room_data' message
  expect (callback).toHaveBeenCalledTimes (1); //Callback should be called once
  expect (callback.mock.calls[0][0]).toEqual ('data'); //Data received from server should be sent back to callback

  GameEngine.disconnect ();
});
