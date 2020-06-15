var express = require ('express');
var router = express.Router ();
var gameroom = require ('../utils/gameroom');
var gameserver = require ('../utils/gameserver');
var gamengine = require ('../utils/gameengine');

// define the default route
router.get ('/', (req, res) => {
  let roomData = gameroom.getAllRooms ();
  let roomList = [];
  for (let [id, room] of roomData) {
    roomList.push ({room: room.roomname, id: room.id});
  }
  console.log ('Rooms route GET was triggered', roomList);
  res.status (200).send (roomList);
});

// Get room by room id
router.get ('/:roomId', (req, res) => {
  let roomData = gameroom.getRoom (parseInt (req.params.roomId));
  if (roomData) {
    res.status (200).send ({data: roomData});
  } else {
    res.status (200).send ({error: 'Room not found'});
  }
});

// define the create room route
router.post ('/', (req, res) => {
  console.log (
    'Request created to start a new game with room name: ',
    req.body.room,
    req.body.config
  );
  let roomdata = gameroom.createRoom (req.body.room);
  gamengine.handleGameInit (roomdata, req.body.config); //Handle game initialization
  res.status (200).send ({
    id: roomdata.id,
    roomname: roomdata.roomname,
  });
});

// Get user by room id and username
router.get ('/:roomId/user/:username', (req, res) => {
  let exists = gameroom.isUserExists (
    req.params.username,
    parseInt (req.params.roomId)
  );
  if (exists) {
    res.status (200).send ({error: 'Username already taken'});
  } else {
    res.status (200).send ({data: 'success'});
  }
});

module.exports = router;
