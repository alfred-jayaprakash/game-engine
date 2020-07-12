const clientio = require ('socket.io-client');
const http = require ('http');
const serverio = require ('socket.io');
const {handleNewConnection} = require ('./gameserver');
const gameroom = require ('./gameroom');

const {
  JOIN_EVENT,
  GAME_STATUS_EVENT,
  DISCONNECT_EVENT,
  ROOM_DATA_EVENT,
  STATE_EVENT,
  GAME_START,
  GAME_PROGRESS,
  GAME_END,
  GAME_STOP,
} = require ('../../utils/GlobalConfig');

let httpServer;
let httpServerAddr;
let ioServer;
let testRoom;
let firstClientSocket;
let secondClientSocket;
let timeout = 20 * 1000;

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 8080;
const JEST_TIMEOUT = 10000;

describe ('Integration tests', () => {
  /**
 * Setup WS & HTTP servers
 */
  beforeAll (done => {
    //Set timeout
    jest.setTimeout (timeout);

    //Setup the Socket.IO Server
    httpServer = http.createServer ().listen (SERVER_PORT);
    httpServerAddr = httpServer.address ();
    console.log ('Integration test server running in ', httpServerAddr);
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
  }, timeout);

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
    let clientSocketConnected = true;
    let anotherSocketConnected = true;

    firstClientSocket = createClient ();
    firstClientSocket.on ('connect', () => {
      console.log ('First client successfully connected');
      clientSocketConnected = true;
    });

    secondClientSocket = createClient ();
    secondClientSocket.on ('connect', () => {
      console.log ('Second client successfully connected');
      anotherSocketConnected = true;
    });

    setTimeout (() => {
      if (clientSocketConnected && anotherSocketConnected) done ();
    }, JEST_TIMEOUT);
  }, timeout);

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
    return clientio.connect (`http://${SERVER_HOST}:${SERVER_PORT}`, {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
    });
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
    let username = 'Alan';
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
    //Setup a Game room
    let newRoom = gameroom.createRoom ('Jest1');
    newRoom.gameConfig = {
      //Dummy config
      type: 1,
    };

    let username = 'Bob';
    joinRoom (
      firstClientSocket,
      {username, room: newRoom.id},
      (error, data) => {
        expect (error).toBeFalsy ();
        expect (data).toBeTruthy ();

        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username, room: newRoom.id},
          (error, data) => {
            expect (data).toBeFalsy ();
            expect (error).toBeTruthy ();
            expect (newRoom.users.length).toEqual (1); //There should be 1 users now
            done ();
          }
        );
      }
    );
  });

  test ('able to join a valid room with different id', done => {
    //Setup a Game room
    let newRoom = gameroom.createRoom ('Jest1');
    newRoom.gameConfig = {
      //Dummy config
      type: 1,
    };
    joinRoom (
      firstClientSocket,
      {username: 'Carl', room: newRoom.id},
      (error, data) => {
        expect (error).toBeFalsy ();
        expect (data).toBeTruthy ();

        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'Dave', room: newRoom.id},
          (error, data) => {
            expect (error).toBeFalsy ();
            expect (data).toBeTruthy ();
            expect (newRoom.users.length).toEqual (2); //There should be 2 users now
            done ();
          }
        );
      }
    );
  });

  test ('able to disconnect', done => {
    //Setup a Game room
    let newRoom = gameroom.createRoom ('Jest1');
    newRoom.gameConfig = {
      //Dummy config
      type: 1,
    };

    joinRoom (
      firstClientSocket,
      {username: 'AJ', room: newRoom.id},
      (error, data) => {
        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'John', room: newRoom.id},
          (error, data) => {
            secondClientSocket.disconnect ();

            // Use timeout to wait for socket.io server handshakes
            setTimeout (() => {
              console.log (newRoom.users);
              expect (newRoom.users.length).toEqual (2); //Should remain two
              expect (newRoom.users[0].active).toBe (true);
              expect (newRoom.users[1].active).toBe (false);
              done ();
            }, JEST_TIMEOUT);
          }
        );
      }
    );
  });

  test ('able to start a new game', done => {
    //Setup a Game room
    let newRoom = gameroom.createRoom ('Jest1');
    newRoom.gameConfig = {
      //Dummy config
      type: 1,
    };

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
      {username: 'Eng', room: newRoom.id},
      (error, data) => {
        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'Frank', room: newRoom.id},
          (error, data) => {
            //Both clients joined
            firstClientSocket.emit (GAME_STATUS_EVENT, {
              //Send a start event
              status: GAME_START,
              room: newRoom.id,
            });
            // Use timeout to wait for socket.io server handshakes
            setTimeout (() => {
              expect (firstClientReceivedStart).toBeTruthy ();
              expect (secondClientReceivedStart).toBeTruthy ();
              done ();
            }, JEST_TIMEOUT);
          }
        );
      }
    );
  });

  test ('able to send a game progress with different responses', done => {
    //Setup a Game room
    let newRoom = gameroom.createRoom ('Jest1');
    newRoom.gameConfig = {
      //Dummy config
      type: 1,
    };

    let firstClientReceivedProgress = false;
    firstClientSocket.on (GAME_STATUS_EVENT, data => {
      if (data && data.scores) firstClientReceivedProgress = true;
    });

    let secondClientReceivedProgress = false;
    secondClientSocket.on (GAME_STATUS_EVENT, data => {
      if (data && data.scores) secondClientReceivedProgress = true;
    });

    joinRoom (
      firstClientSocket,
      {username: 'AJ', room: newRoom.id},
      (error, data) => {
        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'John', room: newRoom.id},
          (error, data) => {
            //Both clients joined
            firstClientSocket.emit (GAME_STATUS_EVENT, {
              //Send a start event
              status: GAME_START,
              room: newRoom.id,
            });

            firstClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_PROGRESS,
              room: newRoom.id,
              state: {
                ref: 1,
                response: 'one',
              },
            });

            secondClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_PROGRESS,
              room: newRoom.id,
              state: {
                ref: 1,
                response: 'two',
              },
            });

            // Use timeout to wait for socket.io server handshakes
            setTimeout (() => {
              expect (firstClientReceivedProgress).toBeTruthy ();
              expect (secondClientReceivedProgress).toBeTruthy ();
              done ();
            }, JEST_TIMEOUT);
          }
        );
      }
    );
  });

  test ('able to send a game progress with same responses', done => {
    //Setup a Game room
    let newRoom = gameroom.createRoom ('Jest2');
    newRoom.gameConfig = {
      //Dummy config
      type: 1,
    };

    let firstClientReceivedProgress = false;
    firstClientSocket.on (STATE_EVENT, data => {
      if (data && data.ref) firstClientReceivedProgress = true;
    });

    let secondClientReceivedProgress = false;
    secondClientSocket.on (STATE_EVENT, data => {
      if (data && data.ref) secondClientReceivedProgress = true;
    });

    joinRoom (
      firstClientSocket,
      {username: 'AJ', room: newRoom.id},
      (error, data) => {
        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'John', room: newRoom.id},
          (error, data) => {
            //Both clients joined
            firstClientSocket.emit (GAME_STATUS_EVENT, {
              //Send a start event
              status: GAME_START,
              room: newRoom.id,
            });

            firstClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_PROGRESS,
              room: newRoom.id,
              state: {
                ref: 2,
                response: 'three',
              },
            });

            secondClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_PROGRESS,
              room: newRoom.id,
              state: {
                ref: 2,
                response: 'three',
              },
            });

            // Use timeout to wait for socket.io server handshakes
            setTimeout (() => {
              expect (firstClientReceivedProgress).toBeTruthy ();
              expect (secondClientReceivedProgress).toBeTruthy ();
              done ();
            }, JEST_TIMEOUT);
          }
        );
      }
    );
  });

  test ('able to end game without affecting others', done => {
    //Setup a Game room
    let newRoom = gameroom.createRoom ('Jest2');
    newRoom.gameConfig = {
      //Dummy config
      type: 1,
    };

    let firstClientReceivedEnd, secondClientReceivedEnd = false;
    joinRoom (
      firstClientSocket,
      {username: 'AJ', room: newRoom.id},
      (error, data) => {
        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'John', room: newRoom.id},
          (error, data) => {
            //Both clients joined
            firstClientSocket.emit (GAME_STATUS_EVENT, {
              //Send a start event
              status: GAME_START,
              room: newRoom.id,
            });

            firstClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_PROGRESS,
              room: newRoom.id,
              state: {
                ref: 3,
                response: 'one',
              },
            });

            secondClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_PROGRESS,
              room: newRoom.id,
              state: {
                ref: 3,
                response: 'two',
              },
            });

            firstClientSocket.on (GAME_STATUS_EVENT, data => {
              if (data && data.status === GAME_END)
                firstClientReceivedEnd = true;
            });

            secondClientSocket.on (GAME_STATUS_EVENT, data => {
              if (data && data.status === GAME_END)
                secondClientReceivedEnd = true;
            });

            firstClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_END,
              room: newRoom.id,
            });

            // Use timeout to wait for socket.io server handshakes
            setTimeout (() => {
              expect (firstClientReceivedEnd).toBeTruthy ();
              expect (secondClientReceivedEnd).toBeFalsy ();
              done ();
            }, JEST_TIMEOUT);
          }
        );
      }
    );
  });

  test ('able to stop game for everyone', done => {
    //Setup a Game room
    let newRoom = gameroom.createRoom ('Jest3');
    newRoom.gameConfig = {
      //Dummy config
      type: 1,
    };

    let firstClientReceivedEnd, secondClientReceivedEnd = false;
    joinRoom (
      firstClientSocket,
      {username: 'AJ', room: newRoom.id},
      (error, data) => {
        //Now join as second client
        joinRoom (
          secondClientSocket,
          {username: 'John', room: newRoom.id},
          (error, data) => {
            //Both clients joined
            firstClientSocket.emit (GAME_STATUS_EVENT, {
              //Send a start event
              status: GAME_START,
              room: newRoom.id,
            });

            firstClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_PROGRESS,
              room: newRoom.id,
              state: {
                ref: 3,
                response: 'one',
              },
            });

            secondClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_PROGRESS,
              room: newRoom.id,
              state: {
                ref: 3,
                response: 'two',
              },
            });

            firstClientSocket.on (GAME_STATUS_EVENT, data => {
              if (data && data.status === GAME_STOP)
                firstClientReceivedEnd = true;
            });

            secondClientSocket.on (GAME_STATUS_EVENT, data => {
              if (data && data.status === GAME_STOP)
                secondClientReceivedEnd = true;
            });

            firstClientSocket.emit (GAME_STATUS_EVENT, {
              status: GAME_STOP,
              room: newRoom.id,
            });

            // Use timeout to wait for socket.io server handshakes
            setTimeout (() => {
              expect (firstClientReceivedEnd).toBeTruthy ();
              expect (secondClientReceivedEnd).toBeTruthy ();
              done ();
            }, JEST_TIMEOUT);
          }
        );
      }
    );
  });
});
