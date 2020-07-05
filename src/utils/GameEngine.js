import io from 'socket.io-client';
const {
  JOIN_EVENT,
  GAME_STATUS_EVENT,
  DISCONNECT_EVENT,
  ROOM_DATA_EVENT,
  STATE_EVENT,
} = require ('./GlobalConfig');

const ENDPOINT = process.env.REACT_APP_SERVER_URL || '/';

let socket = null;

var GameEngine = (function () {
  return {
    connect: function () {
      socket = io (ENDPOINT);
      socket.on (DISCONNECT_EVENT, () => {
        //Nothing for now
      });
    },
    join: function (username, room, callback) {
      socket.emit (JOIN_EVENT, {username, room}, (error, data) => {
        callback (error, data);
      });
    },
    registerForRoomNotifications: function (callback) {
      socket.on (ROOM_DATA_EVENT, data => {
        callback (data);
      });
    },
    sendGameStatus: function (gameData, callback) {
      socket.emit (GAME_STATUS_EVENT, gameData, data => {
        callback (data);
      });
    },
    registerForGameStatus: function (callback) {
      socket.on (GAME_STATUS_EVENT, data => {
        callback (data);
      });
    },
    registerForGameStateUpdates: function (callback) {
      socket.on (STATE_EVENT, data => {
        callback (data);
      });
    },
    disconnect: function () {
      //socket = null;
    },
  };
}) ();

export default GameEngine;
