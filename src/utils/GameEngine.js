import io from 'socket.io-client';
const ENDPOINT = process.env.REACT_APP_SERVER_URL || '/';

let socket = null;

var GameEngine = (function () {
  return {
    connect: function () {
      socket = io (ENDPOINT);
      socket.on ('disconnect', () => {
        //Nothing for now
      });
    },
    createRoom: function (room, callback) {
      socket.emit ('create_room', {room}, (error, data) => {
        callback (error, data);
      });
    },
    join: function (username, room, callback) {
      socket.emit ('join', {username, room}, (error, data) => {
        callback (error, data);
      });
    },
    registerForRoomNotifications: function (callback) {
      socket.on ('room_data', data => {
        callback (data);
      });
    },
    registerForGameStart: function (callback) {
      socket.on ('game_start', data => {
        callback (data);
      });
    },
    disconnect: function () {
      //socket = null;
    },
  };
}) ();

export default GameEngine;
