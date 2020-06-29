const express = require ('express');
const http = require ('http');
const path = require ('path');
const socketIo = require ('socket.io');
const rooms = require ('./routes/rooms');
const {handleNewConnection} = require ('./utils/gameserver');

const port = process.env.PORT || 3001;

//Setup express
const app = require ('./app');

//Create Socket.io server
const server = http.createServer (app);
const io = socketIo (server); // Interesting!
io.on ('connection', socket => handleNewConnection (io, socket)); //Logic to handle new connections

//Finally listen to the port
server.listen (port, () => console.log (`Listening on port ${port}`));
