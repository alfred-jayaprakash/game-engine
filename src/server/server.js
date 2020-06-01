const express = require ('express');
const http = require ('http');
const path = require ('path');
const socketIo = require ('socket.io');

const port = process.env.PORT || 3001;
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require ('./utils/users');
const {generateMessage} = require ('./utils/messages');

const app = express ();
app.use (express.static (path.join (__dirname, '../../build')));
app.get ('/', function (req, res) {
  res.sendFile (path.join (__dirname, '../../build', 'index.html'));
});

const server = http.createServer (app);

const io = socketIo (server); // < Interesting!

io.on ('connection', socket => {
  //Connect handler
  console.log ('New client connected');

  //Game join handler
  socket.on ('join', (options, callback) => {
    const {error, user} = addUser ({id: socket.id, ...options});

    if (error) {
      //If error, return straightaway
      return callback (error, null);
    }

    broadcast (socket, user).then (() => {
      //Tell others that the user has joined
      console.log (user.username, 'joined the game', user.room);
    });

    return callback (null, getUsersInRoom (user.room)); //All's well
  });

  //Disconnect handler
  socket.on ('disconnect', () => {
    const user = removeUser (socket.id);
    if (user) {
      io.to (user.room).emit ('user_leave', user.username); //Tell everyone user has left
      io.to (user.room).emit ('room_data', {
        room: user.room,
        users: getUsersInRoom (user.room),
      }); //Send the updated user list
    }
  });
});

//
// Broadcast join events to rooms asynchronously
//
function broadcast (socket, user) {
  return new Promise ((resolve, reject) => {
    setTimeout (() => {
      socket.join (user.room);

      socket.emit ('message', generateMessage ('System', 'welcome'));
      socket.broadcast.to (user.room).emit ('user_join', user.username); //Tell everyone that the user has joined
      io.to (user.room).emit ('room_data', {
        //Send updated user list
        room: user.room,
        users: getUsersInRoom (user.room),
      });
      resolve ();
    }, 0);
  });
}

server.listen (port, () => console.log (`Listening on port ${port}`));
