import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:3001/';

var GameEngine = (function () {
  let socket = null;

  return {
    connect: function () {
      console.log ('Connect');
      socket = io (ENDPOINT);
    },
    join: function (username, room, callback) {
      if (socket == null) this.connect ();
      console.log ('join', username, room);
      socket.emit ('join', {username, room}, callback);
    },
    registerForRoomNotifications: function (callback) {
      console.log ('registerForRoomNotifications was called');
      socket.on ('ROOM_DATA', data => {
        callback (data);
      });
    },
    disconnect: function () {
      console.log ('Disconnect');
    },
  };
}) ();

export default GameEngine;
