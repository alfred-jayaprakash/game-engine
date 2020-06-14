import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Toast,
  ToastHeader,
  ToastBody,
} from 'reactstrap';
import GameEngine from '../utils/GameEngine';
import ControlPanel from '../components/ControlPanel';
import TimerPanel from '../components/TimerPanel';
import ScorePanel from '../components/ScorePanel';
import GamePanel from '../components/GamePanel';

let initialized = false;

const WAITING_STATUS = 'wait';
const GAME_START = 'start';
const GAME_PROGRESS = 'run';
// eslint-disable-next-line
const GAME_END = 'end';

const GameScreen = props => {
  // eslint-disable-next-line
  const [users, setUsers] = useState ([]);
  const [error, setError] = useState ('');
  const [gameStatus, setGameStatus] = useState (WAITING_STATUS);
  const [duration, setDuration] = useState (30);
  const [currentRef, setCurrentRef] = useState ('');
  const [currentImage, setCurrentImage] = useState ('');
  const [counter, setCounter] = useState (0);
  const [gameMetaData, setGameMetaData] = useState ([]);
  const [score, setScore] = useState (0);
  const history = useHistory ();

  //One-time initialization
  if (!initialized) {
    //Following state values set by calling function in Join Screen
    let user = props.location.state.user;
    let room = props.location.state.room;

    console.log ('Joining as ', user, 'to room =', room);
    GameEngine.connect ();
    GameEngine.join (user, parseInt (room), (error, data) => {
      if (error) {
        setError (error + '. Redirecting in 3 secs ...');
        setTimeout (() => {
          history.push ('/');
        }, 3000);
      } else {
        setUsers (data);
      }
    });

    GameEngine.registerForRoomNotifications (data => {
      console.log ('Received updated user list in GameScreen', data);
      if (data && data.users) {
        setUsers (data.users);
      }
    });

    GameEngine.registerForGameStatus (data => {
      console.log ('Received game status change in GameScreen', data);
      if (data) {
        if (data.status) setGameStatus (data.status);
        if (data.state) {
          setGameMetaData (data.state);
          if (data.state.length > 0) {
            setCurrentRef (data.state[counter].ref);
            setCurrentImage (data.state[counter].url);
          }
        }
        if (data.config && data.config.time) {
          console.log ('Setting duration as :', data.config.time);
          setDuration (data.config.time);
        }
        if (data.scores) {
          let userScoreData = data.scores.find (
            user => user.user === props.location.state.user
          ); //Find my own score
          setScore (userScoreData.score); //And set it
        }
      }
    });
    initialized = true;
  }

  //
  // When user answers
  //
  const onAnswer = answer => {
    console.log ('Received answer =', answer);
    GameEngine.sendGameStatus (
      {
        room: props.location.state.room,
        status: GAME_PROGRESS,
        state: {
          ref: currentRef,
          response: answer,
        },
      },
      data => {
        console.log ('Receive Game progress change response');
      }
    );
  };

  //
  // Timer complete
  //
  const onTimeOver = () => {
    console.log ('Timer has ended. Resetting time');
    setCounter (counter + 1); //Increment the counter
    if (counter < gameMetaData.length) {
      //If there are more states to process
      setCurrentRef (gameMetaData[counter].ref); //Set the contents to next data
      setCurrentImage (gameMetaData[counter].url); //Set the contents to the next data
    } else {
      setGameStatus (GAME_END);
      GameEngine.sendGameStatus (
        {
          room: props.location.state.room,
          status: GAME_END,
        },
        data => {
          console.log ('Receive Game end response');
        }
      );
    }
  };

  return (
    <Container
      className="flex-column justify-content-center bg-dark text-light vertical-center"
      fluid={true}
    >
      {error !== '' &&
        <Row><Col><Alert color="danger">{error}</Alert></Col></Row>}
      {gameStatus === WAITING_STATUS &&
        <Row>
          <Col>
            <Toast>
              <ToastHeader
                className="text-primary"
                icon={<Spinner size="sm" />}
              >
                Waiting ...
              </ToastHeader>
              <ToastBody className="text-dark">
                Please wait for other players to join
              </ToastBody>
            </Toast>
          </Col>
        </Row>}

      {gameStatus === GAME_START &&
        <div>
          <ScorePanel score={score} />
          <TimerPanel
            duration={duration}
            onTimeOver={onTimeOver}
            currentRef={currentRef}
          />
          <GamePanel
            currentRef={currentRef}
            currentImage={currentImage}
            onAnswer={onAnswer}
          />
          <ControlPanel />
        </div>}

      {gameStatus === GAME_END &&
        <div className="p-3 my-2 rounded bg-docs-transparent-grid text-dark">
          <Toast>
            <ToastHeader>
              Game Ended
            </ToastHeader>
            <ToastBody>
              Your final score is {score}
            </ToastBody>
          </Toast>
        </div>}
    </Container>
  );
};

export default GameScreen;
