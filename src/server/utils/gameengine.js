const gamedata = [{url: ''}, {url: ''}, {url: ''}, {url: ''}, {url: ''}];

let gameConfig = {
  gametype: 1,
  time: 30,
};

//
// Handle game start
//
const handleGameStart = data => {
  return {
    status: data.status,
    config: gameConfig,
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
