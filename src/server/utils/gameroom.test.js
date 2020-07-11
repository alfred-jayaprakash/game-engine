const gameroom = require ('./gameroom');
const {GAME_PROGRESS} = require ('../../utils/GlobalConfig');
let testRoom;
let testRoomId;

describe ('Functional tests', () => {
  test ('getAllRooms initially should return only empty rooms', () => {
    let rooms = gameroom.getAllRooms ();
    expect (rooms).toBeTruthy (); //Rooms should not be null
  });

  test ('Create a single room', () => {
    testRoom = gameroom.createRoom ('test');
    expect (testRoom).toBeTruthy (); //Room should not be null
    expect (testRoom.roomname).toEqual ('test'); //Room name should be 'tests'
    expect (gameroom.getAllRooms ().size).toBe (1); //Total rooms should be exactly 1
    testRoomId = testRoom.id; //Lets preserve this
  });

  test ('Create 2 rooms', () => {
    let room1 = gameroom.createRoom ('first');
    let room2 = gameroom.createRoom ('second');

    expect (room1.roomname).toEqual ('first'); //Room name should be 'first'
    expect (room2.roomname).toEqual ('second'); //Room name should be 'first'
    expect (gameroom.getAllRooms ().size).toBe (3); //Total rooms should be 3 now
  });

  test ('Remove a newly created room', () => {
    let room3 = gameroom.createRoom ('third');

    let room4 = gameroom.createRoom ('fourth');

    let temp = gameroom.removeRoom (room3.id);
    expect (temp).toBeTruthy (); //Room should not empty
    expect (temp.roomname).toEqual ('third'); //Removed room should be third

    expect (gameroom.getAllRooms ().size).toBe (4); //There should be only 4 rooms now
  });

  test ('Remove an invalid room', () => {
    let temp = gameroom.removeRoom (99999);
    expect (temp).toBeFalsy (); //Room should be empty

    expect (gameroom.getAllRooms ().size).toBe (4); //No room should have been removed
  });

  test ('Add a new user to a room', () => {
    const tempUser = {
      id: 3,
      username: 'John Doe',
      room: testRoomId,
      score: 0,
      active: true,
    };
    const {user, error} = gameroom.addUser (tempUser);
    expect (error).toBeFalsy (); //Error should be empty
    expect (user).toBeTruthy (); //User should not be empty
    expect (user).toEqual (tempUser);
  });

  test ('Add a duplicate user to a room', () => {
    const tempUser = {
      id: 4,
      username: 'John Doe',
      room: testRoomId,
    };
    const {user, error} = gameroom.addUser (tempUser);
    expect (user).toBeFalsy (); //User should be empty
    expect (error).toBeTruthy (); //Error should not be empty
  });

  test ('Add a user to a non existent room', () => {
    const tempUser = {
      id: 4,
      username: 'Jake Sully',
      room: 9999,
    };
    const {user, error} = gameroom.addUser (tempUser);
    expect (user).toBeFalsy (); //User should be empty
    expect (error).toBeTruthy (); //Error should not be empty
  });

  test ('Add a user with name longer than 20 characters', () => {
    const tempUser = {
      id: 5,
      username: 'abcdefghijiklmnopqrstu',
      room: testRoomId,
    };
    const {user, error} = gameroom.addUser (tempUser);
    expect (user).toBeFalsy (); //User should be empty
    expect (error).toBeTruthy (); //Error should not be empty
  });

  test ('Remove user from room', () => {
    const user = gameroom.removeUser (3);
    expect (user).toBeTruthy (); //User should not be empty
    expect (user).toEqual ({
      id: 3,
      username: 'John Doe',
      score: 0,
      room: testRoomId,
      active: true,
    });
  });

  test ('Remove non-existent user from room', () => {
    const user = gameroom.removeUser (99);
    expect (user).toBeFalsy (); //User should be empty
  });

  test ('Remove named user from room', () => {
    gameroom.addUser ({
      id: 7,
      username: 'Dwayne The Rock',
      room: testRoomId,
    });
    const {user, error} = gameroom.removeUserFromRoom (
      'Dwayne The Rock',
      testRoomId
    );
    expect (error).toBeFalsy (); //Error should be empty
    expect (user).toBeTruthy (); //User should not be empty
  });

  test ('Get all users in room', () => {
    gameroom.addUser ({
      id: 8,
      username: 'Peter Parker',
      room: testRoomId,
    });
    gameroom.addUser ({
      id: 9,
      username: 'Batman and Robin',
      room: testRoomId,
    });

    let users = gameroom.getUsersInRoom (testRoomId);
    expect (users).toBeTruthy (); //Users should not be empty
  });

  test ('Get a user by socket id', () => {
    let room1 = gameroom.createRoom ('first');
    let room2 = gameroom.createRoom ('second');

    gameroom.addUser ({
      id: 1,
      username: 'Alan',
      room: room1.id,
    });
    gameroom.addUser ({
      id: 2,
      username: 'Bob',
      room: room1.id,
    });
    gameroom.addUser ({
      id: 3,
      username: 'Carl',
      room: room2.id,
    });
    gameroom.addUser ({
      id: 4,
      username: 'Dave',
      room: room2.id,
    });

    let user = gameroom.getUser (2);
    expect (user.username).toEqual ('Bob');

    user = gameroom.getUser (4);
    expect (user.username).toEqual ('Dave');
  });

  test ('Add a user to a room with Game already in progress', () => {
    testRoom.status = GAME_PROGRESS;

    const tempUser = {
      id: 5,
      username: 'Jest',
      room: testRoomId,
    };
    const {user, error} = gameroom.addUser (tempUser);
    expect (user).toBeFalsy (); //User should be empty
    expect (error).toBeTruthy (); //Error should not be empty
  });
});
