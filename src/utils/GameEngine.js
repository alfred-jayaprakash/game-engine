import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:3001/';

let socket = null;

var GameEngine = (function () {
  return {
    connect: function () {
      console.log ('Connect');
      socket = io (ENDPOINT);
      socket.on ('disconnect', () => {
        this.disconnect ();
      });
    },
    join: function (username, room, callback) {
      if (socket === null) this.connect ();
      console.log ('join', username, room);
      socket.emit ('join', {username, room}, (error, data) => {
        callback (error, data);
      });
    },
    registerForRoomNotifications: function (callback) {
      socket.on ('room_data', data => {
        console.log ('Received room data from server', data);
        callback (data);
      });
    },
    registerForGameStart: function (callback) {
      socket.on ('game_start', data => {
        console.log ('Received game data from server', data);
        callback (data);
      });
    },
    disconnect: function () {
      socket = null;
    },
  };
}) ();

export default GameEngine;
