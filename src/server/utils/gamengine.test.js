const gameengine = require ('./gameengine');
const gameroom = require ('./gameroom');
const {
  handleGameInit,
  handleGameStart,
  handleGameProgress,
  handleGameEnd,
} = require ('./gameengine');
const {
  GAME_START,
  GAME_PROGRESS,
  DEFAULT_SCORE,
  GAME_END,
} = require ('../../utils/GlobalConfig');

let photoengine;
let testRoom;
let config;
let firstUser;
let secondUser;
let thirdUser;
let fourthUser;

describe ('Functional tests', () => {
  beforeAll (() => {
    // tell jest not to mock gameroom
    jest.unmock ('./photoengine');

    // require the actual module so that we can mock exports on the module
    photoengine = require.requireActual ('./photoengine');
    photoengine.getPhotos = jest
      .fn ()
      .mockResolvedValue (['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']);

    // Create a sample room where we will run most of our tests
    testRoom = gameroom.createRoom ('jest');

    // Create 4 users
    firstUser = {
      id: 996,
      username: 'jest1',
      room: testRoom.id,
    };

    secondUser = {
      id: 997,
      username: 'jest2',
      room: testRoom.id,
    };

    thirdUser = {
      id: 998,
      username: 'jest3',
      room: testRoom.id,
    };

    fourthUser = {
      id: 999,
      username: 'jest4',
      room: testRoom.id,
    };

    // Add the 4 test users
    firstUser = gameroom.addUser (firstUser).user;
    secondUser = gameroom.addUser (secondUser).user;
    thirdUser = gameroom.addUser (thirdUser).user;
    fourthUser = gameroom.addUser (fourthUser).user;
  });

  beforeEach (() => {
    // Setup
  });

  test ('handleGameInit should attach game config and initial game data', async () => {
    let config = {
      category: 'office',
      questions: 5,
    };
    await handleGameInit (testRoom, config);

    expect (testRoom.gameMetaData).toBeTruthy ();
    expect (testRoom.gameConfig).toBeTruthy ();
    expect (testRoom.gameConfig).toBe (config);
  });

  test ('handleGameStart should return game config and initial game data', () => {
    let data = {
      status: GAME_START,
      room: testRoom,
    };
    let gameStartResponse = handleGameStart (data);

    expect (gameStartResponse.status).toEqual (GAME_START);
    expect (gameStartResponse.config).toBeTruthy ();
    expect (gameStartResponse.state).toBeTruthy ();
  });

  test ('handleGameProgress for user with new answer should not change score', () => {
    let state_data = {
      status: GAME_PROGRESS,
      room: testRoom,
      user: firstUser,
      state: {
        response: 'one',
        ref: 1,
      },
    };
    let gameProgressResponse = handleGameProgress (state_data);

    expect (gameProgressResponse).toBeTruthy ();
    expect (testRoom.gamedata).toBeTruthy ();
    expect (firstUser.score).toBe (0); //No increase to score

    // No update to anyone
    expect (gameProgressResponse.update_users).toBeFalsy ();
    expect (gameProgressResponse.update_data).toBeFalsy ();
  });

  test ('handleGameProgress for another user with same answer should change scores', () => {
    let state_data = {
      status: GAME_PROGRESS,
      room: testRoom,
      user: secondUser,
      state: {
        response: 'one',
        ref: 1,
      },
    };

    //Call Game progress response
    let gameProgressResponse = handleGameProgress (state_data);

    expect (gameProgressResponse).toBeTruthy ();
    expect (testRoom.gamedata).toBeTruthy ();

    expect (firstUser.score).toBe (DEFAULT_SCORE); //Score should be increased
    expect (secondUser.score).toBe (DEFAULT_SCORE); //Score should be increased

    //Therefore 2 users should score updates
    expect (gameProgressResponse.update_users).toBeTruthy ();
    expect (gameProgressResponse.update_users.length).toBe (2);

    // Score update should contain the ref, answer and users that answered
    expect (gameProgressResponse.update_data).toBeTruthy ();
    expect (gameProgressResponse.update_data).toEqual ({
      ref: 1,
      answer: 'one',
      users: ['jest1', 'jest2'],
    });
  });

  test ('handleGameProgress for third user with same answer should change scores', () => {
    let state_data = {
      status: GAME_PROGRESS,
      room: testRoom,
      user: thirdUser,
      state: {
        response: 'one',
        ref: 1,
      },
    };

    //Call Game progress response
    let gameProgressResponse = handleGameProgress (state_data);

    expect (gameProgressResponse).toBeTruthy ();
    expect (testRoom.gamedata).toBeTruthy ();

    expect (firstUser.score).toBe (DEFAULT_SCORE * 2); //Score should be increased
    expect (secondUser.score).toBe (DEFAULT_SCORE * 2); //Score should be increased
    expect (thirdUser.score).toBe (DEFAULT_SCORE); //Score should be increased

    //Therefore 2 users should score updates
    expect (gameProgressResponse.update_users).toBeTruthy ();
    expect (gameProgressResponse.update_users.length).toBe (3);

    // Score update should contain the ref, answer and users that answered
    expect (gameProgressResponse.update_data).toBeTruthy ();
    expect (gameProgressResponse.update_data).toEqual ({
      ref: 1,
      answer: 'one',
      users: ['jest1', 'jest2', 'jest3'],
    });
  });

  test ('handleGameProgress for second user with different answer should not change score', () => {
    let state_data = {
      status: GAME_PROGRESS,
      room: testRoom,
      user: secondUser,
      state: {
        response: 'two',
        ref: 1,
      },
    };

    //Call Game progress response
    let gameProgressResponse = handleGameProgress (state_data);

    expect (gameProgressResponse).toBeTruthy ();
    expect (testRoom.gamedata).toBeTruthy ();

    expect (firstUser.score).toBe (DEFAULT_SCORE * 2); //Score should not change
    expect (secondUser.score).toBe (DEFAULT_SCORE * 2); //Score should not change
    expect (thirdUser.score).toBe (DEFAULT_SCORE); //Score should not change

    // No update to anyone
    expect (gameProgressResponse.update_users).toBeFalsy ();
    expect (gameProgressResponse.update_data).toBeFalsy ();
  });

  test ('handleGameProgress for third user with same answer should change scores', () => {
    let state_data = {
      status: GAME_PROGRESS,
      room: testRoom,
      user: fourthUser,
      state: {
        response: 'two',
        ref: 1,
      },
    };

    //Call Game progress response
    let gameProgressResponse = handleGameProgress (state_data);

    expect (gameProgressResponse).toBeTruthy ();
    expect (testRoom.gamedata).toBeTruthy ();

    expect (firstUser.score).toBe (DEFAULT_SCORE * 2); //Score should not be increased
    expect (secondUser.score).toBe (DEFAULT_SCORE * 3); //Score should be increased
    expect (thirdUser.score).toBe (DEFAULT_SCORE); //Score should not be increased
    expect (thirdUser.score).toBe (DEFAULT_SCORE); //Score should be increased

    //Therefore 2 users should score updates
    expect (gameProgressResponse.update_users).toBeTruthy ();
    expect (gameProgressResponse.update_users.length).toBe (2);

    // Score update should contain the ref, answer and users that answered
    expect (gameProgressResponse.update_data).toBeTruthy ();
    expect (gameProgressResponse.update_data).toEqual ({
      ref: 1,
      answer: 'two',
      users: ['jest2', 'jest4'],
    });
  });

  test ('handleGameProgress for user with same answer different ref should not change scores', () => {
    let state_data = {
      status: GAME_PROGRESS,
      room: testRoom,
      user: firstUser,
      state: {
        response: 'one',
        ref: 2,
      },
    };

    //Call Game progress response
    let gameProgressResponse = handleGameProgress (state_data);

    expect (gameProgressResponse).toBeTruthy ();
    expect (testRoom.gamedata).toBeTruthy ();

    expect (firstUser.score).toBe (DEFAULT_SCORE * 2); //Score should not be increased
    expect (secondUser.score).toBe (DEFAULT_SCORE * 3); //Score should not be increased
    expect (thirdUser.score).toBe (DEFAULT_SCORE); //Score should not be increased
    expect (thirdUser.score).toBe (DEFAULT_SCORE); //Score should not be increased

    // No update to anyone
    expect (gameProgressResponse.update_users).toBeFalsy ();
    expect (gameProgressResponse.update_data).toBeFalsy ();
  });

  test ('handleGameProgress for second user with same answer different ref should change scores', () => {
    let state_data = {
      status: GAME_PROGRESS,
      room: testRoom,
      user: secondUser,
      state: {
        response: 'one',
        ref: 2,
      },
    };

    //Call Game progress response
    let gameProgressResponse = handleGameProgress (state_data);

    expect (gameProgressResponse).toBeTruthy ();
    expect (testRoom.gamedata).toBeTruthy ();

    expect (firstUser.score).toBe (DEFAULT_SCORE * 3); //Score should be increased
    expect (secondUser.score).toBe (DEFAULT_SCORE * 4); //Score should be increased
    expect (thirdUser.score).toBe (DEFAULT_SCORE); //Score should not be increased
    expect (thirdUser.score).toBe (DEFAULT_SCORE); //Score should not be increased

    //Therefore 2 users should score updates
    expect (gameProgressResponse.update_users).toBeTruthy ();
    expect (gameProgressResponse.update_users.length).toBe (2);

    // Score update should contain the ref, answer and users that answered
    expect (gameProgressResponse.update_data).toBeTruthy ();
    expect (gameProgressResponse.update_data).toEqual ({
      ref: 2,
      answer: 'one',
      users: ['jest1', 'jest2'],
    });
  });

  test ('handleGameEnd should return successfully', () => {
    let data = {
      status: GAME_END,
    };
    let gameEndResponse = handleGameEnd (data);

    expect (gameEndResponse.status).toEqual (GAME_END);
  });
});
