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
    sendGameStatus: function (gameData, callback) {
      socket.emit ('game_status', gameData, data => {
        callback (data);
      });
    },
    registerForGameStatus: function (callback) {
      socket.on ('game_status', data => {
        callback (data);
      });
    },
    registerForGameStateUpdates: function (callback) {
      socket.on ('state', data => {
        callback (data);
      });
    },
    disconnect: function () {
      //socket = null;
    },
  };
}) ();

export default GameEngine;
