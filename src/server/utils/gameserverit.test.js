const clientio = require ('socket.io-client');
const http = require ('http');
const serverio = require ('socket.io');
const {handleNewConnection} = require ('./gameserver');
const gameroom = require ('./gameroom');

const JOIN_EVENT = 'join';
const GAME_STATUS_EVENT = 'game_status';
const DISCONNECT_EVENT = 'disconnect';
const ROOM_DATA_EVENT = 'room_data';
const STATE_EVENT = 'state';

const GAME_START = 'start';
const GAME_PROGRESS = 'run';
const GAME_END = 'end';

let clientSocket;
let httpServer;
let httpServerAddr;
let ioServer;
let testRoom;
let anotherSocket;

describe ('Integration tests', () => {
  /**
 * Setup WS & HTTP servers
 */
  beforeAll (done => {
    //Setup the Socket.IO Server
    httpServer = http.createServer ().listen ();
    httpServerAddr = httpServer.address ();
    ioServer = serverio (httpServer);

    //Setup connection handler from GameServer.js
    ioServer.on ('connection', socket =>
      handleNewConnection (ioServer, socket)
    ); //Logic to handle new connections

    //Setup a Game room
    testRoom = gameroom.createRoom ('Jest');

    done ();
  });

  /**
 *  Cleanup WS & HTTP servers
 */
  afterAll (done => {
    ioServer.close ();
    httpServer.close ();
    done ();
  });

  /**
 * Run before each test
 */
  beforeEach (done => {
    // Setup
    // Do not hardcode server port and address, square brackets are used for IPv6
    clientSocket = createClient ();
    clientSocket.on ('connect', () => {
      done ();
    });
  });

  /**
 * Run after each test
 */
  afterEach (done => {
    // Cleanup
    if (clientSocket.connected) {
      clientSocket.disconnect ();
    }
    done ();
  });

  const createClient = () => {
    // Do not hardcode server port and address, square brackets are used for IPv6
    return clientio.connect (
      `http://[${httpServerAddr.address}]:${httpServerAddr.port}`,
      {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true,
        transports: ['websocket'],
      }
    );
  };

  const joinRoom = (socket, options, callback) => {
    socket.emit (JOIN_EVENT, options, (error, data) => callback (error, data));
  };

  test ('invalid room should result in error', done => {
    let username = 'AJ';
    let room = 123456;
    joinRoom (clientSocket, {username, room}, (error, data) => {
      expect (data).toBeFalsy ();
      expect (error).toBeTruthy ();
      expect (error).toBe ('Invalid room');
      done ();
    });
  });

  test ('able to join a valid room', done => {
    let username = 'AJ';
    joinRoom (clientSocket, {username, room: testRoom.id}, (error, data) => {
      expect (error).toBeFalsy ();
      expect (data).toBeTruthy ();
      done ();
    });
  });

  test ('unable to join a valid room with same id', done => {
    let username = 'AJ';
    let clientSocketConnected, anotherSocketConnected = false;
    joinRoom (clientSocket, {username, room: testRoom.id}, (error, data) => {
      expect (error).toBeFalsy ();
      expect (data).toBeTruthy ();
      done ();
      clientSocketConnected = true;
    });
    anotherSocket = createClient ();
    joinRoom (anotherSocket, {username, room: testRoom.id}, (error, data) => {
      expect (data).toBeFalsy ();
      expect (error).toBeTruthy ();
      anotherSocketConnected = true;
    });

    setTimeout (() => {
      done ();
    }, 50);
  });

  // test ('able to join a valid room with different id', done => {
  //   let clientSocketConnected, anotherSocketConnected = false;
  //   joinRoom (
  //     clientSocket,
  //     {username: 'AJ', room: testRoom.id},
  //     (error, data) => {
  //       expect (error).toBeFalsy ();
  //       expect (data).toBeTruthy ();
  //       done ();
  //       clientSocketConnected = true;
  //     }
  //   );
  //   anotherSocket = createClient ();
  //   joinRoom (
  //     anotherSocket,
  //     {username: 'John', room: testRoom.id},
  //     (error, data) => {
  //       expect (error).toBeFalsy ();
  //       expect (data).toBeTruthy ();
  //       anotherSocketConnected = true;
  //     }
  //   );

  //   setTimeout (() => {
  //     done ();
  //   }, 50);
  // });
});
