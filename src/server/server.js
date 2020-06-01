const express = require ('express');
const http = require ('http');
const path = require ('path');
const socketIo = require ('socket.io');
const {handleNewConnection} = require ('./utils/gameserver');

const port = process.env.PORT || 3001;

//
// Handle new connections
//
const app = express ();
app.use (express.static (path.join (__dirname, '../../build')));
app.get ('/', function (req, res) {
  res.sendFile (path.join (__dirname, '../../build', 'index.html'));
});

const server = http.createServer (app);
const io = socketIo (server); // Interesting!
io.on ('connection', socket => handleNewConnection (io, socket)); //Logic to handle new connections

server.listen (port, () => console.log (`Listening on port ${port}`));
