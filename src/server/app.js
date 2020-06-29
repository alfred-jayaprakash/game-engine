const express = require ('express');
const path = require ('path');
const rooms = require ('./routes/rooms');

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

module.exports = app;
