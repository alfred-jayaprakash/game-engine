const express = require ('express');
const http = require ('http');
const path = require ('path');
const socketIo = require ('socket.io');
const rooms = require ('./routes/rooms');
const {handleNewConnection} = require ('./utils/gameserver');

const port = process.env.PORT || 3001;

//Setup express
const app = express ();

//Setup static files directory
app.use (express.static (path.join (__dirname, '../../build')));

//By default load the index.html that will load the React SPA
app.get ('/', function (req, res) {
  res.sendFile (path.join (__dirname, '../../build', 'index.html'));
});

//Setup the rooms router to serve requests coming to /rooms
app.use (express.json ());
app.use ('/rooms', rooms); //Use the rooms router

//Create Socket.io server
const server = http.createServer (app);
const io = socketIo (server); // Interesting!
io.on ('connection', socket => handleNewConnection (io, socket)); //Logic to handle new connections

//Finally listen to the port
server.listen (port, () => console.log (`Listening on port ${port}`));
