var express = require ('express');
var router = express.Router ();
var gameroom = require ('../utils/gameroom');

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

// define the default route
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
