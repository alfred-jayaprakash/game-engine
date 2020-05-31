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
  res.sendFile (path.join (__dirname, 'build', 'index.html'));
});

const server = http.createServer (app);

const io = socketIo (server); // < Interesting!

const getApiAndEmit = socket => {
  const response = new Date ();
  // Emitting a new message. Will be consumed by the client
  socket.emit ('FromAPI', response);
};

let interval;

io.on ('connection', socket => {
  //Connect handler
  console.log ('New client connected');

  //Game join handler
  socket.on ('join', (options, callback) => {
    const {error, user} = addUser ({id: socket.id, ...options});
    if (error) {
      return callback (error);
    }

    socket.join (user.room);

    socket.emit ('message', generateMessage ('System', 'welcome'));
    socket.broadcast
      .to (user.room)
      .emit (
        'message',
        generateMessage ('System', `${user.username} has joined!`)
      );
    io.to (user.room).emit ('roomData', {
      room: user.room,
      users: getUsersInRoom (user.room),
    });
  });

  //Disconnect handler
  socket.on ('disconnect', () => {
    console.log ('Client disconnected');
    //clearInterval (interval);
  });
});

server.listen (port, () => console.log (`Listening on port ${port}`));
