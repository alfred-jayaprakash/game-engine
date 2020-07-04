const photoengine = require ('./photoengine');

//
// Handle game initialization
//
const handleGameInit = async (room, config) => {
  let photos = await photoengine.getPhotos (config.category, config.questions); //Get the list of photos from Photo Engine

  let idx = 1;
  let gameMetaData = photos.map (photo => ({url: photo, ref: idx++}));
  room.gameMetaData = gameMetaData;
  room.gameConfig = config;
};

//
// Handle game start
//
const handleGameStart = data => {
  //Data object has important stuff to maintain game progress
  let room = data.room;
  return {
    status: data.status,
    config: room.gameConfig,
    state: room.gameMetaData,
  };
};

const handleGameProgress = game_state_data => {
  const current_room = game_state_data.room; //Room for which the data was sent for
  const current_user = game_state_data.user; // User that sent this data
  const gamestate = game_state_data.state; // Game state for this user in this room
  const answer = gamestate.response; //User's answer
  let game_engine_response = {};

  if (answer && current_user) {
    if (current_room.gamedata == null) {
      console.log ('No game data found in room. Creating one ...');
      current_room.gamedata = new Map ();
    } else {
      console.log ('Game data found in the room ');
    }
    const gamedata = current_room.gamedata;

    /**
     * Now lets get the game reference point e.g. 1st question, 2nd question
     */
    let ref_ans_data = gamedata.get (gamestate.ref);
    if (ref_ans_data == null) {
      console.log (
        'Reference ans data not found. Creating one for ',
        gamestate.ref
      );
      ref_ans_data = new Map (); //List of all answers
      gamedata.set (gamestate.ref, ref_ans_data);
    } else {
      console.log ('Game state found for ref');
    }

    /**
     * Now lets get the answers data for the corresponding questions
     */
    let answered_users = ref_ans_data.get (answer.toLowerCase ());
    let users_to_update_state = [];
    if (answered_users == null) {
      console.log ('No data for answer yet = ', answer);
      answered_users = [];
      answered_users.push (current_user.username); //Add the username to the list of answered users
      ref_ans_data.set (answer.toLowerCase (), answered_users); //Set this data in reference ans data
      users_to_update_state.push (current_user.id); //Users who should receive the new state
    } else {
      //Answers was already answered
      console.log ('Given answer was already provided = ', answer);
      answered_users.push (current_user.username); //Add the user to list of users
      answered_users.forEach (username => {
        let answered_user = current_room.users.find (
          user => user.username === username
        );
        if (answered_user) {
          // console.log (
          //   answered_user,
          //   'had previously provided answer ',
          //   answer
          // );
          answered_user.score += 100; //Add 100 for each of the users
          users_to_update_state.push (answered_user.id); //Users who should receive the new state
        }
      });
    }
    //Update the answer to be sent along with the users that got same answer
    game_state_data.update_data = {
      answer: answer.toLowerCase (),
      users: answered_users,
    };

    game_state_data.update_users = users_to_update_state; //Set the users that need to be updated with the new state
  } else {
    console.log ('No answer was provided. Hence nothing to process.');
  }

  return game_engine_response;
};

const handleGameEnd = data => {
  return {
    status: data.status,
  };
};

module.exports = {
  handleGameInit,
  handleGameStart,
  handleGameProgress,
  handleGameEnd,
};
