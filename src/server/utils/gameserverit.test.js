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

let httpServer;
let httpServerAddr;
let ioServer;
let testRoom;
let firstClientSocket;
let secondClientSocket;

describe ('Integration tests', () => {
  /**
 * Setup WS & HTTP servers
 */
  beforeAll (done => {
    //Set timeout
    jest.setTimeout (20000);

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
    testRoom.gameConfig = {
      //Dummy config
      type: 1,
    };

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
    let clientSocketConnected = true;
    let anotherSocketConnected = true;

    firstClientSocket = createClient ();
    firstClientSocket.on ('connect', () => {
      clientSocketConnected = true;
    });

    secondClientSocket = createClient ();
    secondClientSocket.on ('connect', () => {
      anotherSocketConnected = true;
    });

    setTimeout (() => {
      if (clientSocketConnected && anotherSocketConnected) done ();
    }, 5000);
  });

  /**
 * Run after each test
 */
  afterEach (done => {
    // Cleanup
    if (firstClientSocket.connected) {
      firstClientSocket.disconnect ();
    }

    if (secondClientSocket.connected) {
      secondClientSocket.disconnect ();
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
    joinRoom (firstClientSocket, {username, room}, (error, data) => {
      expect (data).toBeFalsy ();
      expect (error).toBeTruthy ();
      expect (error).toBe ('Invalid room');
      expect (testRoom.users.length).toEqual (0); //There should be 0 users now
      done ();
    });
  });

  test ('able to join a valid room', done => {
    let username = 'AJ';
    joinRoom (
      firstClientSocket,
      {username, room: testRoom.id},
      (error, data) => {
        expect (error).toBeFalsy ();
        expect (data).toBeTruthy ();
        expect (testRoom.users.length).toEqual (1); //There should be 1 users now
        done ();
      }
    );
  });

  test ('unable to join a valid room with same id', done => {
    let username = 'AJ';
    joinRoom (
      firstClientSocket,
      {username, room: testRoom.id},
      (error, data) => {
        expect (error).toBeFalsy ();
        expect (data).toBeTruthy ();

        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username, room: testRoom.id},
          (error, data) => {
            expect (data).toBeFalsy ();
            expect (error).toBeTruthy ();
            expect (testRoom.users.length).toEqual (1); //There should be 1 users now
            done ();
          }
        );
      }
    );
  });

  test ('able to join a valid room with different id', done => {
    joinRoom (
      firstClientSocket,
      {username: 'AJ', room: testRoom.id},
      (error, data) => {
        expect (error).toBeFalsy ();
        expect (data).toBeTruthy ();

        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'John', room: testRoom.id},
          (error, data) => {
            expect (error).toBeFalsy ();
            expect (data).toBeTruthy ();
            expect (testRoom.users.length).toEqual (2); //There should be 2 users now
            done ();
          }
        );
      }
    );
  });

  test ('able to disconnect', done => {
    joinRoom (
      firstClientSocket,
      {username: 'AJ', room: testRoom.id},
      (error, data) => {
        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'John', room: testRoom.id},
          (error, data) => {
            secondClientSocket.disconnect ();

            // Use timeout to wait for socket.io server handshakes
            setTimeout (() => {
              expect (testRoom.users.length).toEqual (1);
              done ();
            }, 3000);
          }
        );
      }
    );
  });

  test ('able to start a new game', done => {
    let firstClientReceivedStart = false;
    firstClientSocket.on (GAME_STATUS_EVENT, data => {
      if (data && data.status === GAME_START && data.config)
        firstClientReceivedStart = true;
    });

    let secondClientReceivedStart = false;
    secondClientSocket.on (GAME_STATUS_EVENT, data => {
      if (data && data.status === GAME_START && data.config)
        secondClientReceivedStart = true;
    });

    joinRoom (
      firstClientSocket,
      {username: 'AJ', room: testRoom.id},
      (error, data) => {
        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'John', room: testRoom.id},
          (error, data) => {
            //Both clients joined
            firstClientSocket.emit (GAME_STATUS_EVENT, {
              //Send a start event
              status: GAME_START,
              room: testRoom.id,
            });
            // Use timeout to wait for socket.io server handshakes
            setTimeout (() => {
              expect (firstClientReceivedStart).toBeTruthy ();
              expect (secondClientReceivedStart).toBeTruthy ();
              done ();
            }, 3000);
          }
        );
      }
    );
  });
});
