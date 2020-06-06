var express = require ('express');
var router = express.Router ();
var gameroom = require ('../utils/gameroom');
var gameserver = require ('../utils/gameserver');

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
    req.body.room
  );
  let roomdata = gameroom.createRoom (req.body.room);
  console.log ('New room create:', roomdata);
  res.status (200).send (roomdata);
});

module.exports = router;
