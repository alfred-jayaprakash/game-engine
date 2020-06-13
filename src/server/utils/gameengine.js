const gameMetaData = [
  {ref: '1', url: '/images/image1.jpg'},
  {ref: '2', url: '/images/image2.jpg'},
  {ref: '3', url: '/images/image3.jpg'},
  {ref: '4', url: '/images/image4.jpg'},
  {ref: '5', url: '/images/image5.jpg'},
];

let gameConfig = {
  gametype: 1,
  time: 30,
  questions: 3,
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
      ref: gameMetaData[0].ref,
      data: gameMetaData[0].url,
    },
  };
};

const handleGameProgress = game_state_data => {
  const room = game_state_data.room; //Room for which the data was sent for
  const user = game_state_data.user; // User that sent this data
  const gamestate = game_state_data.state; // Game state for this user in this room
  const answer = gamestate.response; //User's answer
  let game_engine_response = {};

  if (answer) {
    if (room.gamedata == null) {
      room.gamedata = new Map ();
    }
    const gamedata = room.gamedata;

    /**
     * Now lets get the game reference point e.g. 1st question, 2nd question
     */
    let ref_ans_data = gamedata.get (gamestate.ref);
    if (ref_ans_data == null) {
      ref_ans_data = new Map (); //List of all answers
      gamedata.set (gamestate.ref, ref_ans_data);
    }

    /**
     * Now lets get the answers data for the corresponding questions
     */
    let answered_users = ref_ans_data.get (answer);
    let users_to_update_state = [];
    if (answered_users == null) {
      answered_users = [];
      answered_users.push (user.username); //Add the username to the list of answered users
      gamedata.set (answer, answered_users);
    } else {
      //Answers was already answered
      answered_users.push (user.username); //Add the user to list of users
      answered_users.forEach (username => {
        let answered_user = room.users.find (
          user => user.username === username
        );
        if (answered_user) {
          answered_user.score += 100; //Add 100 for each of the users
          users_to_update_state.push (answered_user.id); //Users who should receive the new state
        }
      });
    }
    //Update the answer to be sent along with the users that got same answer
    game_state_data.update_data = {
      answer,
      users: answered_users,
    };

    game_state_data.update_users = users_to_update_state; //Set the users that need to be updated with the new state
  }

  return game_engine_response;
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
