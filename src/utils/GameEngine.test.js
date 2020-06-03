import io from 'socket.io-client';
import GameEngine from './GameEngine';

let mocksocket = new Object ();
mocksocket.on = jest.fn ();
mocksocket.emit = jest.fn ();
jest.mock ('socket.io-client', () => {
  //Now mock socket.io-client
  return jest.fn ().mockImplementation (() => mocksocket);
});

beforeEach (() => {
  io.mockClear ();
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

  GameEngine.join (username, room, callback);
  expect (io).toHaveBeenCalledTimes (1); //Constructor should be invoked once
  expect (mocksocket.emit).toHaveBeenCalledTimes (1); //Emit should be called once
  expect (mocksocket.emit.mock.calls[0][0]).toEqual ('join'); //And a 'join' message should be sent

  GameEngine.disconnect ();
});
