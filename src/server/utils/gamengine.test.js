const gameengine = require ('./gameengine');

test ('handleGameStart should return game config and initial game data', () => {
  let startData = gameengine.handleGameStart ({
    room: {
      id: 112233,
      roomname: 'Test Room',
      users: [
        {
          id: 'abcdefgh',
          username: 'AJ',
          room: 112233,
        },
      ],
    },
    status: 'start',
  });
  expect (startData).toBeTruthy (); //startData should not be null
});

test ('handleGameProgress should return game progress data', () => {
  let progressData = gameengine.handleGameProgress ({
    room: {
      id: 112233,
      roomname: 'Test Room',
      users: [
        {
          id: 'abcdefgh',
          username: 'AJ',
          room: 112233,
        },
      ],
    },
    status: 'run',
    state: {},
  });
  expect (progressData).toBeTruthy (); //progressData should not be null
});

test ('handleGameEnd should return game end data', () => {
  let gameEndData = gameengine.handleGameEnd ({
    room: {
      id: 112233,
      roomname: 'Test Room',
      users: [
        {
          id: 'abcdefgh',
          username: 'AJ',
          room: 112233,
        },
      ],
    },
    status: 'end',
    data: {},
  });
  expect (gameEndData).toBeTruthy (); //gameEndData should not be null
});
