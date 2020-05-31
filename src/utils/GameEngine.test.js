import GameEngine from './GameEngine';
jest.mock ('socket.io-client');
import io from 'socket.io-client';

beforeEach (() => {
  GameEngine.connect ();
});

afterEach (() => {
  GameEngine.disconnect ();
});

test ('Register for participants list', () => {
  io.on.mockImplementation (callback => {
    callback (['apple', 'bat', 'car']);
  });
});
