const gameData = [
  {ref: '1', url: '/images/image1.jpg'},
  {ref: '2', url: '/images/image2.jpg'},
  {ref: '3', url: '/images/image3.jpg'},
];

let gameConfig = {
  gametype: 1,
  time: 30,
};

//
// Handle game start
//
const handleGameStart = data => {
  //Data object has important stuff to maintain game progress
  let room = data.room;

  return {
    status: data.status,
    config: gameConfig,
    state: {
      ref: gameData[0].ref,
      data: gameData[0].url,
    },
  };
};

const handleGameProgress = data => {
  return {
    status: data.status,
    config: gameConfig,
  };
};

const handleGameEnd = data => {
  return {
    status: data.status,
    config: gameConfig,
  };
};

module.exports = {
  handleGameStart,
  handleGameProgress,
  handleGameEnd,
};
