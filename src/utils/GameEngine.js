import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:3001/';

let socket = null;
let users = [];

var GameEngine = (function () {
  return {
    connect: function () {
      console.log ('Connect');
      socket = io (ENDPOINT);
      socket.on ('disconnect', this.disconnect ());
    },
    join: function (username, room, callback) {
      if (socket == null) this.connect ();
      console.log ('join', username, room);
      socket.emit ('join', {username, room}, (error, data) => {
        if (data) users = data;
        callback (error, data);
      });
    },
    registerForRoomNotifications: function (callback) {
      console.log ('registerForRoomNotifications1 was called');
      socket.on ('room_data', data => {
        console.log ('Received room data from server', data);
        users = data;
        callback (data);
      });
    },
    disconnect: function () {
      console.log ('Disconnected');
      //Do some cleanup
    },
  };
}) ();

export default GameEngine;
