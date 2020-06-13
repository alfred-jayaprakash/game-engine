import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Label,
  Toast,
  ToastHeader,
  ToastBody,
} from 'reactstrap';
import GameEngine from '../utils/GameEngine';
import ControlPanel from '../components/ControlPanel';
import StatusPanel from '../components/StatusPanel';
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
  // eslint-disable-next-line
  const [gameState, setGameState] = useState ('');
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
      if (data && data.status) {
        setGameStatus (data.status);
        console.log (data.state);
        setGameState (data.state);
      }
    });
    initialized = true;
  }

  const onAnswer = answer => {
    console.log ('Received answer =', answer);
    GameEngine.sendGameStatus (
      {
        room: props.location.state.room,
        status: GAME_PROGRESS,
        state: {
          ref: 1,
          response: answer,
        },
      },
      data => {
        console.log ('Receive Game progress change response');
      }
    );
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
          <StatusPanel />
          <ScorePanel />
          <GamePanel imgsrc="/images/image1.jpg" onAnswer={onAnswer} />
          <ControlPanel />
        </div>}
    </Container>
  );
};

export default GameScreen;
